import subprocess
import sys
from typing import Any, Dict, List, Set, Tuple
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.processors.node_map import (
    NODE_INDEGREE,
    NODE_PROCESSING_FUNCTIONS,
    NODE_INSPECTION_FUNCTIONS,
)
from app.classes import GraphPayload, InspectRequest
import graphlib

from app.package_manager import get_node_status

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

    for edg in graph.edges:
        # going from tgt to source becuase we actually want to generate the dependency list
        dep_list[edg.target].add(edg.source)

    # --- In-degree validation using our dynamically loaded config ---
    validation_errors: List[str] = []
    for node_id, parents in dep_list.items():
        node_type = nmap[node_id].type
        expected_indegree = NODE_INDEGREE.get(node_type)

        is_valid: bool = False

        if isinstance(expected_indegree, int) and len(parents) == expected_indegree:
            is_valid = True
        elif (
            isinstance(expected_indegree, list)
            and expected_indegree[0] <= len(parents) <= expected_indegree[1]
        ):
            is_valid = True

        if not is_valid:
            validation_errors.append(
                f"Node '{nmap[node_id].data.label}' expects {expected_indegree} inputs but has {len(parents)}."
            )
            return {
                "status": "error",
                "message": " ".join(validation_errors),
                "errorNodeId": node_id,
            }
    # --------------------------------

    # PERFORM topological sort
    try:
        ts: graphlib.TopologicalSorter[str] = graphlib.TopologicalSorter(dep_list)

        # Tuple used for immutability &
        # elipse used to denote tuple of arbitary length
        exec_order: Tuple[str, ...] = tuple(ts.static_order())

        # to hold the results of interim processing
        results: Dict[str, Any] = {}

        display_outputs: Dict[str, str] = {}

        for node_id in exec_order:
            node = nmap[node_id]
            try:
                # --- THIS IS THE CORE ERROR HANDLING BLOCK ---
                print(f"Executing node: {node_id} ({node.type})")
                processing_fun = NODE_PROCESSING_FUNCTIONS.get(node.type)
                
                if processing_fun:
                    parent_node_ids = dep_list[node_id]
                    parent_results = [results[parent_id] for parent_id in parent_node_ids]
                    
                    result = processing_fun(node.data, parent_results)
                    results[node_id] = result
                    
                    if node.type == "displayNode":
                        display_outputs[node_id] = result.to_json(orient='records')
                # ------------------------------------------
            except Exception as e:
                # If anything inside the block fails, catch it and return a detailed error
                print(f"ERROR executing node {node_id}: {e}")
                return {
                    "status": "error",
                    "message": str(e),
                    "errorNodeId": node_id
                }

        return {
            "status": "success",
            "message": "Graph executed!",
            "exec_order": exec_order,
            "output": display_outputs
        }
    except graphlib.CycleError as e:
        return {"status": "error", "message": f"Graph contains a cycle: {e}"}
    

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


if __name__ == "__main__":
    pass
