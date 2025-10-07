import subprocess
import sys
from typing import Any, Dict, List, Set, Tuple
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.processors.node_map import NODE_INDEGREE, NODE_PROCESSING_FUNCTIONS, NODE_INSPECTION_FUNCTIONS
from app.classes import GraphPayload, InspectRequest
import graphlib
import pandas as pd

from app.package_manager import get_node_status



app = FastAPI()

origins = [
    'http://localhost:5173',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def read_root():
    return {"message": "Hello from the AI Graph Executor Backend!"}

@app.post('/execute')
def execute_graph(graph: GraphPayload) -> Dict[str, Any]:
    nmap = {node.id: node for node in graph.nodes} # HASHMAP for quickly finding nodes


    # We would need to perform topological sort as the nodes could be in random order, i.e. to make sure dependencies are finished first and then only main task is executed

    # dep_list => DEPENDENCY LIST (opposite of ADJ. LIST)
    dep_list: Dict[str, Set[str]] = {node.id: set() for node in graph.nodes}
    # generated the dep_list

    for edg in graph.edges:
        # going from tgt to source becuase we actually want to generate the dependency list
        dep_list[edg.target].add(edg.source)
    
    # --- In-degree validation using our dynamically loaded config ---
    validation_errors: List[str] = []
    for node_id, parents in dep_list.items():
        node_type = nmap[node_id].type
        expected_indegree = NODE_INDEGREE.get(node_type)
        if (expected_indegree is None) or (len(parents) != expected_indegree):
            validation_errors.append(
                f"Node {node_id} ('{node_type}') expects {expected_indegree} inputs but has {len(parents)}."
            )

    if len(validation_errors)>0:
        return {"status": "error", "message": " ".join(validation_errors)}
    # -----------------------------------------------------------------



    # PERFORM topological sort
    try:
        ts: graphlib.TopologicalSorter[str] = graphlib.TopologicalSorter(dep_list)
        
        # Tuple used for immutability &
        # elipse used to denote tuple of arbitary length
        exec_order: Tuple[str, ...] = tuple(ts.static_order()) 
        
        # to hold the results of interim processing
        results: Dict[str, Any] = {}

        display_outputs: Dict[str,str] = {}

        for node_id in exec_order:
            print(f"Executing node: {node_id}")

            node = nmap[node_id]
            processing_fun = NODE_PROCESSING_FUNCTIONS.get(node.type)
            
            if processing_fun:
                # Find the parent nodes from our dependency list
                parent_node_ids = dep_list[node_id]
                # Get their results from the results dictionary
                parent_results = [results[parent_id] for parent_id in parent_node_ids]
                print(parent_node_ids)
                print(parent_results)
                if (len(parent_results)!=NODE_INDEGREE[node.type]):
                    # Incorrect connections made (node connected with more nodes than what it should have been)
                    print(f"  -> Error: Expected{NODE_INDEGREE[node.type]} inputs, Got {len(parent_results)} inputs")
                    break

                result = processing_fun(node.data, parent_results)
                results[node_id] = result
                if node.type=="displayNode":
                    display_outputs[node_id] = result.to_json(orient='records')
                print(f"  -> Output of {node_id}:\n{result}\n")
            else:
                print(f"  -> No processing function found for type: {node.type}")

        return {
            "status": "success",
            "message": "Graph executed!",
            "exec_order": exec_order,
            "output": display_outputs
        }
    except graphlib.CycleError:
        return {
            "status": "error",
            "message": "Graph contains a cycle and cannot be executed."
        }

@app.get('/nodes/status')
def list_node_statuses():
    """
    Provides the status of all available nodes and their dependencies.
    """
    return get_node_status()

@app.post('/packages/install')
def install_pkg(payload: Dict[str,Any]):
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
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", pkg_name]
        )
        return {
            "status": "success",
            "message": f"Package {pkg_name} installed successfully"
        }
    
    except subprocess.CalledProcessError as err:
        return {
            "status": "error",
            "message": f"Failed to install package: {err}"
        }

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

# @app.post("/inspect")
# async def inspect(request: InspectRequest):
#     """
#     Inspects the graph to determine the input schema for a target node.
#     """
#     # For now, we'll just return a dummy response.
#     # In the future, this is where we'll build the real magic:
#     # 1. Topologically sort the graph up to the `targetNodeId`.
#     # 2. "Dry run" the graph by passing lightweight schema objects.
#     # 3. Return the final schema for the target node's input.
#     print(f"Inspecting schema for input to node: {request.targetNodeId}")
    
#     # Create a quick lookup map for nodes
#     node_map = {node.id: node for node in request.nodes}

#     # Find the parent node connected to the target node's input
#     parent_id = None
#     for edge in request.edges:
#         if edge.target == request.targetNodeId:
#             parent_id = edge.source
#             break
    
#     if not parent_id:
#         # If there's no parent, there are no columns to show
#         return {"columns": []}

#     parent_node = node_map.get(parent_id)
#     if not parent_node:
#         return {"columns": []}

#     # --- THE NEW LOGIC ---
#     # For now, we'll only handle the case where the parent is a CSV loader
#     if parent_node.type == "inputNode":
#         file_path = parent_node.data.filePath
#         if file_path:
#             try:
#                 # Efficiently read only the header row of the CSV
#                 df_header = pd.read_csv(file_path, nrows=0)
#                 return {"columns": df_header.columns.tolist()}
#             except Exception as e:
#                 print(f"Error inspecting CSV: {e}")
#                 return {"columns": [f"Error: {e}"]}
    
#     # If the parent is not an input node, we'll return an empty list for now.
#     # In the future, we will build the full "metadata propagation" here.
#     return {"columns": ["Parent is not a CSV loader"]}

if __name__ == "__main__":
    pass