from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from parser_utils import parse_p4_structure
import os
import logging
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import tempfile
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="P4Lens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "P4Lens API is running", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/upload")
async def upload_p4(file: UploadFile = File(...)):
    # Validate file extension
    if not file.filename.endswith(".p4"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a .p4 file."
        )
    
    try:
        # Save file
        path = os.path.join(UPLOAD_DIR, file.filename)
        content = await file.read()
        
        # Basic validation - check if file is not empty
        if not content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )
        
        with open(path, "wb") as f:
            f.write(content)
        
        logger.info(f"Processing P4 file: {file.filename}")
        
        # Parse structure
        structure = parse_p4_structure(path)
        
        if not structure or len([k for k in structure.keys() if not k.startswith("_")]) == 0:
            raise HTTPException(
                status_code=400,
                detail="Could not parse P4 structure. File may be invalid or empty."
            )
        
        logger.info(f"Successfully parsed {file.filename}")
        return {"filename": file.filename, "structure": structure}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error parsing P4 file: {str(e)}"
        )


def create_excel_export(structure: dict, filename: str) -> str:
    """Create Excel file with P4 rules and installation tables."""
    wb = Workbook()
    
    # Remove default sheet
    wb.remove(wb.active)
    
    # Define styles
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF", size=12)
    title_font = Font(bold=True, size=14)
    border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    # Sheet 1: Tables Overview
    ws_tables = wb.create_sheet("Tables & Rules")
    ws_tables.append(["P4 Tables and Match-Action Rules"])
    ws_tables.merge_cells('A1:F1')
    ws_tables['A1'].font = title_font
    ws_tables['A1'].alignment = Alignment(horizontal='center', vertical='center')
    
    ws_tables.append([])
    headers = ["Table Name", "Match Keys", "Match Type", "Actions", "Size", "Default Action"]
    ws_tables.append(headers)
    
    # Style header row
    for col in range(1, len(headers) + 1):
        cell = ws_tables.cell(row=3, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = border
    
    tables = structure.get("_tables", {})
    for table_name, table_info in tables.items():
        keys = table_info.get("keys", [])
        actions = table_info.get("actions", [])
        size = table_info.get("size", "N/A")
        default_action = table_info.get("default_action", "N/A")
        
        # Parse match types from keys
        match_types = []
        key_names = []
        for key in keys:
            if ":" in key:
                parts = key.split(":")
                key_names.append(parts[0].strip())
                match_types.append(parts[1].strip() if len(parts) > 1 else "exact")
            else:
                key_names.append(key.strip())
                match_types.append("exact")
        
        row = [
            table_name,
            "\n".join(key_names) if key_names else "None",
            "\n".join(match_types) if match_types else "N/A",
            "\n".join(actions) if actions else "None",
            size,
            default_action
        ]
        ws_tables.append(row)
        
        # Add borders to data rows
        for col in range(1, len(row) + 1):
            cell = ws_tables.cell(row=ws_tables.max_row, column=col)
            cell.border = border
            cell.alignment = Alignment(wrap_text=True, vertical='top')
    
    # Adjust column widths
    ws_tables.column_dimensions['A'].width = 20
    ws_tables.column_dimensions['B'].width = 30
    ws_tables.column_dimensions['C'].width = 15
    ws_tables.column_dimensions['D'].width = 25
    ws_tables.column_dimensions['E'].width = 10
    ws_tables.column_dimensions['F'].width = 20
    
    # Sheet 2: Apply Block Logic
    ws_apply = wb.create_sheet("Apply Block Logic")
    ws_apply.append(["Control Block Apply Logic - Main Function Blocks"])
    ws_apply.merge_cells('A1:D1')
    ws_apply['A1'].font = title_font
    ws_apply['A1'].alignment = Alignment(horizontal='center', vertical='center')
    
    ws_apply.append([])
    headers_apply = ["Control Block", "Condition", "Tables Applied", "Logic Flow"]
    ws_apply.append(headers_apply)
    
    # Style header row
    for col in range(1, len(headers_apply) + 1):
        cell = ws_apply.cell(row=3, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = border
    
    # Extract control blocks and their apply logic
    for name, info in structure.items():
        if not name.startswith("_") and info.get("type") == "control":
            apply_logic = info.get("apply_logic", {})
            conditions = apply_logic.get("conditions", [])
            tables_applied = apply_logic.get("tables_applied", [])
            logic = apply_logic.get("logic", [])
            
            if conditions:
                for cond in conditions:
                    row = [
                        name,
                        cond.get("condition", "N/A"),
                        ", ".join(tables_applied) if tables_applied else "None",
                        "\n".join(logic) if logic else "No logic"
                    ]
                    ws_apply.append(row)
            else:
                # Direct table applications
                row = [
                    name,
                    "Always (no condition)",
                    ", ".join(tables_applied) if tables_applied else "None",
                    "\n".join(logic) if logic else "No logic"
                ]
                ws_apply.append(row)
            
            # Add borders
            for col in range(1, len(headers_apply) + 1):
                cell = ws_apply.cell(row=ws_apply.max_row, column=col)
                cell.border = border
                cell.alignment = Alignment(wrap_text=True, vertical='top')
    
    ws_apply.column_dimensions['A'].width = 20
    ws_apply.column_dimensions['B'].width = 40
    ws_apply.column_dimensions['C'].width = 30
    ws_apply.column_dimensions['D'].width = 50
    
    # Sheet 3: Actions
    ws_actions = wb.create_sheet("Actions")
    ws_actions.append(["Action Definitions"])
    ws_actions.merge_cells('A1:E1')
    ws_actions['A1'].font = title_font
    ws_actions['A1'].alignment = Alignment(horizontal='center', vertical='center')
    
    ws_actions.append([])
    headers_actions = ["Control Block", "Action Name", "Parameters", "Operations", "Description"]
    ws_actions.append(headers_actions)
    
    # Style header row
    for col in range(1, len(headers_actions) + 1):
        cell = ws_actions.cell(row=3, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', vertical='center')
        cell.border = border
    
    for name, info in structure.items():
        if not name.startswith("_") and info.get("type") == "control":
            actions = info.get("actions", [])
            for action in actions:
                params = action.get("parameters", [])
                param_str = ", ".join([f"{p.get('type', '')} {p.get('name', '')}" for p in params])
                operations = ", ".join(action.get("operations", []))
                
                row = [
                    name,
                    action.get("name", "N/A"),
                    param_str if param_str else "None",
                    operations if operations else "N/A",
                    action.get("body_preview", "N/A")[:100]
                ]
                ws_actions.append(row)
                
                # Add borders
                for col in range(1, len(headers_actions) + 1):
                    cell = ws_actions.cell(row=ws_actions.max_row, column=col)
                    cell.border = border
                    cell.alignment = Alignment(wrap_text=True, vertical='top')
    
    ws_actions.column_dimensions['A'].width = 20
    ws_actions.column_dimensions['B'].width = 20
    ws_actions.column_dimensions['C'].width = 30
    ws_actions.column_dimensions['D'].width = 25
    ws_actions.column_dimensions['E'].width = 50
    
    # Save to temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
    wb.save(temp_file.name)
    temp_file.close()
    
    return temp_file.name


@app.post("/export-excel")
async def export_excel(structure: Dict[str, Any] = Body(...)):
    """Export P4 structure to Excel format."""
    try:
        filename = structure.get("_filename", "p4_export")
        excel_path = create_excel_export(structure, filename)
        return FileResponse(
            excel_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=f"{filename.replace('.p4', '')}_rules.xlsx"
        )
    except Exception as e:
        logger.error(f"Error creating Excel export: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating Excel export: {str(e)}"
        )

