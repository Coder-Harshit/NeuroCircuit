from typing import Dict, Set, Tuple, Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from classes import GraphPayload
import graphlib

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
def execute_graph(graph: GraphPayload) -> Dict[str, Union[str, Tuple[str, ...] ]]:
    print(graph.edges)
    # We would need to perform topological sort as the nodes could be in random order, i.e. to make sure dependencies are finished first and then only main task is executed

    # dep_list => DEPENDENCY LIST (opposite of ADJ. LIST)
    dep_list: Dict[str, Set[str]] = {node.id: set() for node in graph.nodes}
    # generated the dep_list

    for edg in graph.edges:
        # going from tgt to source becuase we actually want to generate the dependency list
        dep_list[edg.target].add(edg.source)
    
    print(f"Constructed Adjacency List: {dep_list}")


    # PERFORM topological sort
    try:
        ts: graphlib.TopologicalSorter[str] = graphlib.TopologicalSorter(dep_list)
        
        # Tuple used for immutability &
        # elipse used to denote tuple of arbitary length
        exec_order: Tuple[str, ...] = tuple(ts.static_order()) 
        print(f"Correct execution order: {exec_order}")
        
        for node_id in exec_order:
            print(f"Executing node: {node_id}")

        return {
            "status": "success",
            "message": "Graph sorted successfully!",
            "execution_order": exec_order
        }
    except graphlib.CycleError:
        return {
            "status": "error",
            "message": "Graph contains a cycle and cannot be executed."
        }

if __name__ == "__main__":
    pass