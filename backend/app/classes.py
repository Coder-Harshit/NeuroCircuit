from pydantic import BaseModel
from typing import Literal, Union


class InputNodeData(BaseModel):
    label: str
    filePath: str = ""


class TransformNodeData(BaseModel):
    label: str
    method: Literal["normalize", "standardize", "pca"]


class HandleMissingNodeData(BaseModel):
    label: str
    strategy: Literal["mean", "median", "most_frequent", "constant"]


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
    axis: Literal[0, 1] = 0


class SelectColumnNodeData(BaseModel):
    label: str
    columns: str
    # nodeType: Literal["selectColumnNode"]


class LoadImageNodeData(BaseModel):
    label: str
    filePath: str = ""


class SaveImageNodeData(BaseModel):
    label: str


class ResizeImageNodeData(BaseModel):
    label: str
    width: int
    height: int


class CvtColorImageNodeData(BaseModel):
    label: str
    in_colorspace: Literal["GRAY", "BGR", "RGB", "HSV", "LAB"]
    out_colorspace: Literal["GRAY", "BGR", "RGB", "HSV", "LAB"]


class FlipImageNodeData(BaseModel):
    label: str
    horizontal: bool = False
    vertical: bool = False


class DisplayImageNodeData(BaseModel):
    label: str


class BlurImageNodeData(BaseModel):
    label: str
    blurType: Literal["GAUSSIAN", "MEDIAN", "BILATERAL"] = "GAUSSIAN"
    kernelSize: int = 5


class CannyEdgeNodeData(BaseModel):
    label: str
    threshold1: int = 100
    threshold2: int = 200


AnyNodeData = Union[
    InputNodeData,
    TransformNodeData,
    HandleMissingNodeData,
    DisplayNodeData,
    NoteNodeData,
    FilterNodeData,
    CombineNodeData,
    SelectColumnNodeData,
    LoadImageNodeData,
    SaveImageNodeData,
    ResizeImageNodeData,
    CvtColorImageNodeData,
    FlipImageNodeData,
    DisplayImageNodeData,
    BlurImageNodeData,
    CannyEdgeNodeData,
]


class Position(BaseModel):
    x: float
    y: float


class NodeData(BaseModel):
    label: str
    filePath: str | None = None
    method: str | None = None
    strategy: str | None = None


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
    nodes: list[Node]
    edges: list[Edge]


class InspectRequest(BaseModel):
    nodes: list[Node]
    edges: list[Edge]
    targetNodeId: str
