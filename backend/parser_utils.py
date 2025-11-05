# import re

# def parse_p4_structure(path):
#     with open(path) as f:
#         code = f.read()

#     sections = {
#         "parser": re.findall(r"parser\s+(\w+)", code),
#         "ingress": re.findall(r"control\s+(\w+).*?ingress", code),
#         "egress": re.findall(r"control\s+(\w+).*?egress", code),
#         "deparser": re.findall(r"control\s+(\w+).*?deparser", code),
#     }
#     return sections


import re,json
from pathlib import Path

def extract_brace_block(code, start_index):
    brace_count = 0
    body = []
    for i in range(start_index, len(code)):
        c = code[i]
        if c == '{':
            brace_count += 1
            if brace_count == 1:
                continue
        elif c == '}':
            brace_count -= 1
            if brace_count == 0:
                return "".join(body), i
        if brace_count >= 1:
            body.append(c)
    return None, None


def analyze_block(block_type, body):
    actions = []

    if block_type == "parser":
        extracts = re.findall(r"extract\((.*?)\)", body)
        transitions = re.findall(r"transition\s+(\w+)", body)
        if extracts:
            actions.append(f"Extracts headers: {', '.join(extracts)}")
        if transitions:
            actions.append(f"Transitions to states: {', '.join(transitions)}")
        if not actions:
            actions.append("Parses incoming packet and extracts headers as defined.")

    elif block_type == "control":
        applies = re.findall(r"apply\((\w+)\)", body)
        sets = re.findall(r"set_metadata\((.*?)\)", body)
        if applies:
            actions.append(f"Applies tables: {', '.join(applies)}")
        if sets:
            actions.append(f"Modifies metadata: {', '.join(sets)}")
        if not actions:
            actions.append("Handles packet processing and table applications.")

    return actions


def parse_p4_structure(path):
    with open(path) as f:
        code = f.read()

    structure = {}

    # --- Base blocks (parser, controls, deparser) ---
    for block_type in ["parser", "control", "deparser"]:
        for name in re.findall(rf"{block_type}\s+(\w+)", code):
            structure[name] = {
                "type": block_type,
                "actions": [],
                "tables": [],
                "externs": [],
                "consts": [],
                "headers": []
            }

    # --- Tables: match fields + keys + actions ---
    table_pattern = re.compile(
        r"table\s+(\w+)\s*\{[^}]*?key\s*=\s*\{([^}]*)\}[^}]*?actions\s*=\s*\{([^}]*)\}",
        re.S,
    )
    tables = {}
    for name, keys_raw, acts_raw in table_pattern.findall(code):
        keys = [k.strip().replace("\n", " ") for k in keys_raw.split(";") if k.strip()]
        acts = [a.strip().split("(")[0] for a in acts_raw.split(";") if a.strip()]
        tables[name] = {"keys": keys, "actions": acts}
    # attach to any control referencing apply(table)
    for ctrl in structure.values():
        if ctrl["type"] == "control":
            applies = re.findall(r"apply\((\w+)\)", code)
            ctrl["tables"].extend([t for t in applies if t in tables])

    # --- Constants / enums ---
    consts = re.findall(r"(?:const|#define)\s+(\w+)\s+([0-9xa-fA-F]+)", code)
    enums = re.findall(r"enum\s+(\w+)\s*\{([^}]*)\}", code, re.S)
    enum_map = {
        name: [v.split("=")[0].strip() for v in body.split(",") if v.strip()]
        for name, body in enums
    }

    # --- Externs ---
    externs = re.findall(r"(Counter|Meter|Register|Digest)\s*<[^>]*>\s+(\w+)", code)
    extern_objs = [{"type": e[0], "name": e[1]} for e in externs]

    # --- Headers ---
    headers = re.findall(r"header\s+(\w+)\s*\{([^}]*)\}", code, re.S)
    header_defs = {
        name: [
            {"field": f.split(":")[0].strip(), "bits": f.split(":")[1].strip("; ")}
            for f in body.split(";")
            if ":" in f
        ]
        for name, body in headers
    }

    # --- Assemble global info ---
    structure["_tables"] = tables
    structure["_consts"] = consts
    structure["_enums"] = enum_map
    structure["_externs"] = extern_objs
    structure["_headers"] = header_defs

    return structure


if __name__ == "__main__":
    import sys
    print(json.dumps(parse_p4_structure(sys.argv[1]), indent=2))