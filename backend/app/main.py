from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from classes import GraphPayload

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
def execute_graph(graph: GraphPayload):
    print("Received Graph Data:")
    print(graph.model_dump_json(indent=2))
    return {
        "status": "success",
        "message": "Graph received successfully!"
    }

if __name__ == "__main__":
    pass