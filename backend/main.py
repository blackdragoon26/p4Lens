from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from parser_utils import parse_p4_structure
import os
import logging

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

