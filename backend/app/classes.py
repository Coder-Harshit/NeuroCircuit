from pydantic import BaseModel
from typing import List, Literal, Optional, Union

class InputNodeData(BaseModel):
    label: str
    filePath: str = ""
    
class TransformNodeData(BaseModel):
    label: str
    method: Literal['normalize', 'standardize', 'pca']

class HandleMissingNodeData(BaseModel):
    label: str
    strategy: Literal['mean', 'median', 'most_frequent', 'constant']

class DisplayNodeData(BaseModel):
    label: str

class NoteNodeData(BaseModel):
    label: str

class FilterNodeData(BaseModel):
    label: str
    column: str
    operator: str
    value: str

class CombineNodeData(BaseModel):
    label: str
    axis: Literal[0,1] = 0

AnyNodeData = Union[
    InputNodeData,
    TransformNodeData,
    HandleMissingNodeData,
    DisplayNodeData,
    NoteNodeData,
    FilterNodeData,
    CombineNodeData
]

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
    data: AnyNodeData

class Edge(BaseModel):
    id: str
    source: str
    target: str

class GraphPayload(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
