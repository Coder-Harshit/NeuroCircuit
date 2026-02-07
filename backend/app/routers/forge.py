import json
from pathlib import Path
from typing import Any
from fastapi import APIRouter, HTTPException
import httpx
from pydantic import BaseModel
import ast
import os

CAUTIOUS_IMPORTS = ('subprocess', 'os', 'shutil', 'sys')
CAUTIOUS_FUNCS = ('eval', 'exec', 'globals', 'locals', '__import__')
CAUTIOUS_ATTRS = ('system', 'popen', 'remove', 'rmdir', 'run','call', 'exec')


class NodeInput(BaseModel):
    name: str
    type: str

class NodeOutput(BaseModel):
    name: str
    type: str

class GenerateRequest(BaseModel):
    nodeType: str
    label: str
    description: str
    inputs: list[NodeInput]
    outputs: list[NodeOutput]
    pythonCode: str

class InstallRequest(BaseModel):
    manifest: dict[str, Any]
    pythonCode: str
    reactCode: str

class AnalysisRequest(BaseModel):
    code: str



router = APIRouter()


@router.get("/health")
async def forge_health_check():
    return {"status": "Forge is online", "mode": "Developer"}

@router.post("/analyze")
async def analyze_code(request: AnalysisRequest):
    try:
        tree = ast.parse(request.code)
    except SyntaxError as err:
        return {
            "status": "Error",
            "message": f"Syntax Error on line {err.lineno}: {err.msg}"
        }
    
    issues = []
    cmplx = 0

    print(tree)
    
    for node in ast.walk(tree):
        # complexity check
        if isinstance(node, (ast.If, ast.For, ast.While, ast.ExceptHandler)):
            # branching statements increases complexity
            cmplx+=1
        
        # security check
        if isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
            # imports could be a security threat
            names = [alias.name for alias in node.names]
            for name in names:
                if name.split('.')[0] in CAUTIOUS_IMPORTS:
                    issues.append(f"Security Warning: Importing '{name}' is discouraged in plugins")
                
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in CAUTIOUS_FUNCS:
                    issues.append(f"Security Warning: Use of function '{node.func.id}' is discouraged in plugins")

            if isinstance(node.func, ast.Attribute):
                if node.func.attr in CAUTIOUS_ATTRS:
                    issues.append(f"Review Required: Call to '{node.func.attr}' detected.")
        
    status = "success"
    if any("Error" in i for i in issues):
        status = "fail"
    elif issues:
        status = "warning"
    
    return {
        "status": status,
        "complexity": cmplx,
        "issues": issues,
        "message": "Analysis complete" if not issues else f"Found {len(issues)} issues"
    }

# --- The Generation Endpoint ---
@router.post("/generate-frontend")
async def generate_frontend(req: GenerateRequest):
    """
    Generates a React Flow component using a local LLM (Ollama).
    Falls back to a basic template if Ollama is unreachable.
    """
    
    # 1. Construct the Prompt (One-Shot Learning)
    # We feed it a stripped-down version of your 'BlurImageNode' as an example.
    prompt = f"""
    You are an expert React developer for a node-based editor using @xyflow/react.
    Create a TypeScript React component for a node named "{req.label}" (type: "{req.nodeType}").
    
    --- RULES ---
    1. Use the "common" tailwind classes provided in the example.
    2. Inputs use <TypedHandle type="target" ... />.
    3. Outputs use <TypedHandle type="source" ... />.
    4. Data is stored in 'data'. Use 'onChange' to update parameters.
    5. Return ONLY the code. No markdown formatting.

    --- EXAMPLE STRUCTURE ---
    import {{ Position }} from "@xyflow/react";
    import {{ TypedHandle }} from "../ui/TypedHandle";
    // ... imports

    export default function {req.nodeType}Node({{ data, id }}: any) {{
      const handleChange = (e: any) => {{
         data.onChange(id, {{ [e.target.name]: e.target.value }});
      }};
      
      return (
        <div className="relative flex flex-col gap-2 rounded-lg border-2 border-[var(--color-border-1)] bg-[var(--color-surface-1)] p-3 shadow-lg w-64">
           {{/* Header */}}
           <div className="mb-2 border-b border-[var(--color-border-2)] pb-2 text-sm font-bold text-[var(--color-text-1)]">
              {req.label}
           </div>
           
           {{/* Body (Inputs/Controls) */}}
           <div className="flex flex-col gap-3">
              {{/* ... controls go here ... */}}
           </div>
           
           {{/* Handles */}}
           {{/* Inputs mapped here */}}
           {{/* Outputs mapped here */}}
        </div>
      );
    }}
    --- END EXAMPLE ---

    --- YOUR TASK ---
    Node Type: {req.nodeType}
    Inputs: {[i.name for i in req.inputs]}
    Outputs: {[o.name for o in req.outputs]}
    Description: {req.description}
    
    Generate the full .tsx file content now.
    """

    # 2. Call Ollama (Standard Localhost Port)
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2.5-coder:latest", # Or "llama3", "mistral" - whatever you have
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.2} # Low temp for code stability
                },
                timeout=30.0
            )
            if response.status_code == 200:
                generated_text = response.json().get("response", "")
                # Cleanup markdown blocks if the LLM added them
                clean_code = generated_text.replace("```tsx", "").replace("```typescript", "").replace("```", "")
                return {"code": clean_code, "source": "AI"}
            
    except Exception as e:
        print(f"Ollama connection failed: {e}. Checking for OpenAI API key...")
        
        # 2.5 Fallback to OpenAI API
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": os.getenv("OPENAI_MODEL", "gpt-4o"),
                            "messages": [
                                {"role": "system", "content": "You are an expert React developer. Return ONLY the code. No markdown."},
                                {"role": "user", "content": prompt}
                            ],
                            "temperature": 0.2
                        },
                        timeout=30.0
                    )
                    if response.status_code == 200:
                        data = response.json()
                        generated_text = data["choices"][0]["message"]["content"]
                        clean_code = generated_text.replace("```tsx", "").replace("```typescript", "").replace("```", "")
                        return {"code": clean_code, "source": "OpenAI"}
                    else:
                        print(f"OpenAI API error: {response.status_code} - {response.text}")
            except Exception as e_openai:
                 print(f"OpenAI connection failed: {e_openai}")

        print("Using fallback template.")

    # 3. Fallback Template (If AI fails)
    # This ensures the user isn't stuck if they don't have Ollama running.
    fallback_code = f"""import {{ Position }} from "@xyflow/react";
import {{ TypedHandle }} from "../ui/TypedHandle";
import {{ {req.nodeType.capitalize()}NodeProps }} from "../../nodeTypes";

export default function {req.nodeType.capitalize()}Node({{ data, id }}: {req.nodeType.capitalize()}NodeProps) {{
  return (
    <div className="relative flex flex-col gap-2 rounded-lg border-2 border-[var(--color-border-1)] bg-[var(--color-surface-1)] p-3 shadow-lg w-64">
      <div className="mb-2 border-b border-[var(--color-border-2)] pb-2 text-sm font-bold text-[var(--color-text-1)]">
        {req.label}
      </div>
      
      {{/* Inputs */}}
      {generate_handles(req.inputs, "target")}

      {{/* Outputs */}}
      {generate_handles(req.outputs, "source")}
    </div>
  );
}}
"""
    return {"code": fallback_code, "source": "Template"}

def generate_handles(items, handle_type):
    # Simple helper to stringify handles for the fallback
    return "\\n".join([f'<TypedHandle type="{handle_type}" position={{Position.{ "Left" if handle_type == "target" else "Right" }}} id="{item.name}" dataType="{item.type}" />' for item in items])

@router.post("/install")
async def install_node(req: InstallRequest):
    """
    Writes all files to disk and patches the frontend registry.
    """
    node_type = req.manifest["nodeType"]
    class_name = f"{node_type[0].upper()}{node_type[1:]}NodeData"
    category = req.manifest["category"]
    
    BASE_DIR = Path(__file__).parent.parent.parent.parent # /
    
    MANIFEST_PATH = BASE_DIR / "backend/app/manifests" / f"{node_type}Node.json"
    PLUGIN_PATH = BASE_DIR / "backend/plugins" / f"{category}_{node_type}.py"
    CLASSES_PATH = BASE_DIR / "backend/app/classes.py"
    COMPONENT_PATH = BASE_DIR / "frontend/src/components/nodes" / f"{node_type}Node.tsx"
    REGISTRY_PATH = BASE_DIR / "frontend/src/components/nodes/nodeRegistry.ts"

    try:
        # 1. Write Manifest (Cleaned up for disk)
        # We must REMOVE inputs/outputs/dependencies from the saved JSON 
        # because your system uses them only for generation, not runtime.
        saved_manifest = {
            "nodeType": node_type,
            "label": req.manifest["label"],
            "category": category,
            "description": req.manifest["description"],
            "dependencies": req.manifest.get("dependencies", []),
            "defaultData": {
                 # Map params to defaultData
                 p["name"]: p["default"] for p in req.manifest.get("params", [])
            }
        }
        # Add label to defaultData as per your convention
        saved_manifest["defaultData"]["label"] = req.manifest["label"]
        
        with open(MANIFEST_PATH, "w") as f:
            json.dump(saved_manifest, f, indent=2)

        # 2. Write Python Plugin
        with open(PLUGIN_PATH, "w") as f:
            f.write(req.pythonCode)

        # 3. Write React Component
        with open(COMPONENT_PATH, "w") as f:
            f.write(req.reactCode)

        # 4. Patch Registry
        update_registry_file(REGISTRY_PATH, node_type)

        # 5. Patch Backend Classes (NEW STEP)
        update_classes_file(CLASSES_PATH, class_name, req.manifest.get("params", []))

        return {"status": "success", "message": f"Node {node_type} installed successfully!"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def update_registry_file(file_path: Path, node_type: str):
    """
    Safely injects imports and registry entries into nodeRegistry.ts
    """
    with open(file_path, "r") as f:
        content = f.read()

    # A. Check if already registered
    if f"{node_type}:" in content:
        return # Already exists, skip patching

    # B. Add Import
    # Look for the last import line
    import_stmt = f'import {node_type.capitalize()}Node from "./{node_type}Node";'
    
    if import_stmt not in content:
        last_import_idx = content.rfind("import ")
        # Find end of that line
        end_of_line = content.find("\n", last_import_idx) + 1
        content = content[:end_of_line] + import_stmt + "\n" + content[end_of_line:]

    # C. Add to Registry Object
    # Look for "export const nodeRegistry = {"
    registry_start = content.find("export const nodeRegistry = {")
    if registry_start != -1:
        # Find the closing brace of that object
        # This is a naive search, assuming the file ends with the registry object close
        # A safer way is to append at the start of the object
        insertion_point = content.find("{", registry_start) + 1
        
        new_entry = f"\n  {node_type}: {node_type.capitalize()}Node,"
        content = content[:insertion_point] + new_entry + content[insertion_point:]

    with open(file_path, "w") as f:
        f.write(content)

def update_classes_file(file_path: Path, class_name: str, params: list[dict]):
    """
    Injects the Pydantic model into classes.py and updates AnyNodeData Union.
    """
    with open(file_path, "r") as f:
        content = f.read()

    # A. Check if class already exists
    if f"class {class_name}(BaseModel):" in content:
        return

    # B. Generate the Class Code
    # We map "number" -> "float" or "int", "string" -> "str", "boolean" -> "bool"
    type_map = {
        "string": "str",
        "number": "float", # Default to float for safety, user can change later
        "boolean": "bool",
        "select": "str"    # Select is usually a string from dropdown
    }
    
    class_code = f"\n\nclass {class_name}(BaseModel):\n    label: str\n"
    for p in params:
        py_type = type_map.get(p["type"], "Any")
        default_val = repr(p["default"]) # repr() handles quotes for strings: "value" -> "'value'"
        
        # If it's a 'select' type, we could try to use Literal, but 'str' is safer for automation
        class_code += f"    {p['name']}: {py_type} = {default_val}\n"

    # C. Inject Class Definition
    # Find where AnyNodeData starts so we can insert BEFORE it
    union_start = content.find("AnyNodeData = Union[")
    if union_start == -1:
        # Fallback: Append to end if structure is weird (unlikely)
        content += class_code
    else:
        content = content[:union_start] + class_code + content[union_start:]

    # D. Update AnyNodeData Union
    # We need to find the list inside AnyNodeData and append our class
    # Regex is risky, string manipulation is simpler if we assume standard formatting
    union_start = content.find("AnyNodeData = Union[")
    if union_start != -1:
        # Find the closing bracket of the Union
        # We look for the next "]" after union_start
        # But to be safe against nested brackets, let's just insert after the first element
        # A simpler strategy: Insert it right after "AnyNodeData = Union[\n"
        
        insertion_point = content.find("\n", union_start) + 1
        new_union_member = f"    {class_name},\n"
        content = content[:insertion_point] + new_union_member + content[insertion_point:]

    with open(file_path, "w") as f:
        f.write(content)