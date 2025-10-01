from pydantic import BaseModel
from typing import List, Optional

class Position(BaseModel):
    x: float
    y: float

class NodeData(BaseModel):
    label: str
    filePath: Optional[str] = None
    method: Optional[str] = None
    strategy: Optional[str] = None
    
class Node(BaseModel):
    id: str
    type: str
    position: Position
    data: NodeData

class Edge(BaseModel):
    id: str
    source: str
    target: str

class GraphPayload(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
