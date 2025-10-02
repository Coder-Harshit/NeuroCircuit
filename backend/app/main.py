import subprocess
import sys
from typing import Any, Dict, List, Set, Tuple
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.processors.node_map import NODE_INDEGREE, NODE_PROCESSING_FUNCTIONS
from app.classes import GraphPayload, InspectRequest
import graphlib

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
        if expected_indegree is not None and len(parents) != expected_indegree:
            validation_errors.append(
                f"Node {node_id} ('{node_type}') expects {expected_indegree} inputs but has {len(parents)}."
            )

    if validation_errors:
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
    # For now, we'll just return a dummy response.
    # In the future, this is where we'll build the real magic:
    # 1. Topologically sort the graph up to the `targetNodeId`.
    # 2. "Dry run" the graph by passing lightweight schema objects.
    # 3. Return the final schema for the target node's input.
    print(f"Inspecting schema for node: {request.targetNodeId}")
    
    # Dummy data for now, just to prove the endpoint works.
    return {"columns": ["dummy_column_1", "dummy_column_2", "dummy_name", "dummy_age"]}


if __name__ == "__main__":
    pass