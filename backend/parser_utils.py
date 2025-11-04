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


import re
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
    code = Path(path).read_text()
    code = re.sub(r"\s+", " ", code)

    # ✅ handles parameter lists before '{'
    pattern = re.compile(r"\b(parser|control)\s+(\w+)\s*\([^)]*\)\s*\{", re.DOTALL)
    matches = list(pattern.finditer(code))

    sections = {}

    for match in matches:
        block_type = match.group(1)
        name = match.group(2)
        start = match.end() - 1
        body, end = extract_brace_block(code, start)
        if body:
            explanation = analyze_block(block_type, body)
            sections[name] = {
                "type": block_type,
                "actions": explanation
            }

    return sections
