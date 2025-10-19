import json
from pathlib import Path
import subprocess
import sys
import shutil
from typing import Any, Dict, List, Set, Tuple
from fastapi import BackgroundTasks, FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.processors.node_map import (
    NODE_INDEGREE,
    NODE_PROCESSING_FUNCTIONS,
    NODE_INSPECTION_FUNCTIONS,
)
from app.classes import GraphPayload, InspectRequest
import graphlib

from app.package_manager import get_node_status

TEMP_UPLOAD_DIR = Path("temp_uploads")
TEMP_UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def remove_file(path: Path):
    try:
        if path.is_file():
            path.unlink()
            print(f"Cleaned up temporary file: {path}")
    except Exception as e:
        print(f"Error removing temporary file {path}: {e}")



@app.get("/")
def read_root():
    return {"message": "Hello from the AI Graph Executor Backend!"}


@app.post("/execute")
def execute_graph(graph: GraphPayload) -> Dict[str, Any]:
    nmap = {node.id: node for node in graph.nodes}  # HASHMAP for quickly finding nodes

    # We would need to perform topological sort as the nodes could be in random order, i.e. to make sure dependencies are finished first and then only main task is executed

    # dep_list => DEPENDENCY LIST (opposite of ADJ. LIST)
    dep_list: Dict[str, Set[str]] = {node.id: set() for node in graph.nodes}
    # generated the dep_list
    
    skipped_nodes: List[str] = [] # To track skipped nodes
    node_errors: Dict[str, str] = {} # To track errors per node

    for edg in graph.edges:
        # going from tgt to source becuase we actually want to generate the dependency list
        if edg.target in nmap and edg.source in nmap:
            dep_list[edg.target].add(edg.source)
        else:
            print(f"Warning: Skipping edge {edg.id} ({edg.source} -> {edg.target}) due to missing node.")


    # --- In-degree validation ---
    for node_id, parents in dep_list.items():
        node = nmap.get(node_id)
        if not node: continue # Skip if node doesn't exist (handled above)
        
        node_type = node.type
        expected_indegree = NODE_INDEGREE.get(node_type)

        is_valid = False
        if isinstance(expected_indegree, int) and len(parents) == expected_indegree:
            is_valid = True
        elif isinstance(expected_indegree, list) and expected_indegree[0] <= len(parents) <= expected_indegree[1]:
            is_valid = True
        
        # Allow nodes with no processing function (like noteNode) to bypass degree checks if not specified
        if expected_indegree is None and node_type not in NODE_PROCESSING_FUNCTIONS:
             is_valid = True

        if not is_valid:
            error_msg = f"Node '{node.data.label}' ({node_id}) expects {expected_indegree} inputs but has {len(parents)}."
            print(f"Validation Error: {error_msg}")
            # Instead of returning immediately, store the error and skip the node later
            node_errors[node_id] = error_msg
            skipped_nodes.append(node_id)
            # We don't return here, let topological sort handle propagation if possible

    # --- Topological Sort and Execution ---
    try:
        # Filter out nodes with validation errors before sorting
        valid_dep_list = {
            node_id: deps for node_id, deps in dep_list.items() if node_id not in node_errors
        }
        ts = graphlib.TopologicalSorter(valid_dep_list)
        exec_order: Tuple[str, ...] = tuple(ts.static_order())
        
        results: Dict[str, Any] = {}
        display_outputs: Dict[str, str] = {}
        dl_files: List[str] = []

        for node_id in exec_order:
            # Although already filtered, double-check just in case
            if node_id in node_errors:
                 if node_id not in skipped_nodes: skipped_nodes.append(node_id)
                 continue # Skip execution if validation failed earlier

            node = nmap[node_id]
            processing_fun = NODE_PROCESSING_FUNCTIONS.get(node.type)

            # --- KEY CHANGE: Check if function exists ---
            if not processing_fun:
                # If it's a known node type that *should* have a function, it means deps are missing.
                # If it's a type that *doesn't* have a function (like noteNode), just ignore it.
                if node.type in NODE_INDEGREE: # Check if it's a known processing node type
                    print(f"Skipping node {node_id} ('{node.data.label}') - processing function missing (likely due to missing dependencies).")
                    if node_id not in skipped_nodes: skipped_nodes.append(node_id)
                    node_errors[node_id] = "Missing dependencies prevents execution."
                    # We don't put anything in results, so downstream nodes will fail or be skipped.
                else:
                    print(f"Ignoring node {node_id} ('{node.data.label}') - no processing function defined.")
                continue # Move to the next node in exec_order
            # --------------------------------------------

            try:
                parent_node_ids = dep_list.get(node_id, set()) # Use .get for safety
                
                # Check if any parent was skipped or errored
                parent_results = []
                can_execute = True
                for parent_id in parent_node_ids:
                    if parent_id in skipped_nodes or parent_id not in results:
                        parent_node = nmap.get(parent_id)
                        parent_label = getattr(getattr(parent_node, "data", None), "label", "Unknown") if parent_node else "Unknown"
                        print(f"Skipping node {node_id} ('{node.data.label}') because parent node {parent_id} was skipped or missing results.")
                        if node_id not in skipped_nodes: skipped_nodes.append(node_id)
                        node_errors[node_id] = f"Input from skipped parent '{parent_label}' ({parent_id})."
                        can_execute = False
                        break
                    parent_results.append(results[parent_id])
                
                if not can_execute:
                    continue # Skip to next node in exec_order

                # --- Execute the node ---
                print(f"Executing node: {node_id} ({node.type})")
                result = processing_fun(node.data, parent_results)
                results[node_id] = result
                
                if node.type == "displayNode":
                    # Safely convert to JSON, handling potential non-serializable data
                    try:
                        display_outputs[node_id] = result.to_json(orient='records', default_handler=str)
                    except Exception as json_err:
                         print(f"Error converting output of {node_id} to JSON: {json_err}")
                         node_errors[node_id] = f"Output could not be displayed: {json_err}"
                         display_outputs[node_id] = json.dumps([{"error": f"Could not serialize output: {json_err}"}])
                elif node.type == "saveImageNode":
                    if isinstance(result, str) and result:
                        dl_files.append(result)

            except Exception as e:
                # Catch errors during the *execution* of a specific node
                error_msg = f"Error executing node '{node.data.label}' ({node_id}): {e}"
                print(error_msg)
                node_errors[node_id] = str(e)
                if node_id not in skipped_nodes: skipped_nodes.append(node_id)
                # Continue the loop to see if other independent branches can run

        # --- Determine Overall Status ---
        final_status = "success"
        if node_errors:
            final_status = "partial_success" if results else "error" # Partial if at least something ran

        return {
            "status": final_status,
            "message": "Graph execution finished.",
            "exec_order": exec_order, # The order attempted
            "output": display_outputs,
            "skipped_nodes": skipped_nodes, # List of IDs that were skipped
            "download_files": dl_files,
            "node_errors": node_errors, # Dictionary of {node_id: error_message}
        }

    except graphlib.CycleError as e:
        print(f"Cycle Error: {e}")
        # Identify nodes involved in the cycle if possible (more advanced)
        return {"status": "error", "message": f"Graph contains a cycle: {e}", "node_errors": {}, "skipped_nodes": list(nmap.keys())}
    except Exception as e:
        # Catch unexpected errors during setup/sorting
        print(f"General Execution Error: {e}")
        return {"status": "error", "message": f"An unexpected error occurred: {e}", "node_errors": {}, "skipped_nodes": list(nmap.keys())}
    
@app.get("/nodes/status")
def list_node_statuses():
    """
    Provides the status of all available nodes and their dependencies.
    """
    return get_node_status()


@app.post("/packages/install")
def install_pkg(payload: Dict[str, Any]):
    """
    Receives a package name and attempts to install it using uv pip
    """
    pkg_name = payload.get("packageName")
    if not pkg_name:
        return {
            "status": "error",
            "message": "No package name provided",
        }
    # else Try to install that pkg
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", pkg_name])
        return {
            "status": "success",
            "message": f"Package {pkg_name} installed successfully",
        }

    except subprocess.CalledProcessError as err:
        return {"status": "error", "message": f"Failed to install package: {err}"}


@app.post("/inspect")
async def inspect(request: InspectRequest):
    """
    Inspects the graph to determine the input schema for a target node by
    performing a lightweight metadata propagation.
    """
    nmap = {node.id: node for node in request.nodes}

    # Build the dependency list for the topological sort
    dep_list: Dict[str, Set[str]] = {node.id: set() for node in request.nodes}
    for edge in request.edges:
        dep_list[edge.target].add(edge.source)

    # Sort the graph topologically to get the execution order
    try:
        ts = graphlib.TopologicalSorter(dep_list)
        sorted_nodes = list(ts.static_order())
    except graphlib.CycleError:
        return {"columns": ["Error: Cycle detected in graph"]}

    # --- METADATA PROPAGATION ---
    # We will store the output schema (column list) of each node here
    schemas: Dict[str, List[str]] = {}

    # "Dry run" the graph, node by node
    for node_id in sorted_nodes:
        node = nmap[node_id]

        # Find the schemas of the parent nodes
        parent_ids = dep_list[node.id]
        input_schemas = [schemas.get(pid, []) for pid in parent_ids]

        # Get the appropriate inspection function for this node type
        inspect_func = NODE_INSPECTION_FUNCTIONS.get(node.type)

        if inspect_func:
            # Call the node's inspection function with its data and input schemas
            output_schema = inspect_func(node.data, input_schemas)
            schemas[node.id] = output_schema
        else:
            # If no inspection function, assume the schema passes through unchanged
            # (This is a safe default for nodes like "Note" or "Display")
            schemas[node.id] = input_schemas[0] if input_schemas else []

        # If we have just processed the parent of our target, we have our answer
        for edge in request.edges:
            if edge.target == request.targetNodeId and edge.source == node_id:
                return {"columns": schemas.get(node_id, [])}

    # If the target node had no parent or something went wrong
    return {"columns": []}

@app.post('/files/upload')
async def upload_file(file: UploadFile = File(...)):
    """
    Accepts a file upload, saves it to a temporary directory on the server,
    and returns the path to the saved file.
    """
        
    try:
        if file.filename is None: raise Exception("No file uploaded")
        temp_fp = TEMP_UPLOAD_DIR / file.filename

        with open(temp_fp, "wb") as bfr:
            shutil.copyfileobj(file.file, bfr)

        return {"status": "success", "filePath": str(temp_fp)}
    except Exception as e:
        return {"status": "error", "message": f"Could not upload file: {e}"}
    finally:
        # Close the file to release resources
        file.file.close()

@app.get('/files/download')
async def download_file(filepath: str, bg_tasks: BackgroundTasks):
    """
    Downloads a file from the temporary directory and deletes it afterwards.
    """
    try:
        # Create the full path and resolve any ".." components
        secure_base_path = TEMP_UPLOAD_DIR.resolve()
        file_to_download = (secure_base_path / Path(filepath).name).resolve()

        # SECURITY CHECK
        if secure_base_path not in file_to_download.parents:
            raise HTTPException(status_code=403, detail="Access denied: File is outside the allowed directory.")

        if not file_to_download.is_file():
            raise HTTPException(status_code=404, detail="File not found.")

        bg_tasks.add_task(remove_file, file_to_download)

        return FileResponse(
            path=str(file_to_download),
            filename=file_to_download.name,
            media_type='application/octet-stream'
        )
    except Exception as e:
        # Log the error on the server for debugging
        print(f"Error preparing file download for {filepath}: {e}")
        # Raise a generic error for the client
        raise HTTPException(status_code=500, detail="Could not process file for download.")
    
if __name__ == "__main__":
    pass
