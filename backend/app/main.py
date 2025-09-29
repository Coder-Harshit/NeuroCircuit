from typing import Any, Dict, Set, Tuple
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.processors.node_degree import NODE_INDEGREE
from app.processors.node_map import NODE_PROCESSING_FUNCTIONS
from app.classes import GraphPayload
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


if __name__ == "__main__":
    pass