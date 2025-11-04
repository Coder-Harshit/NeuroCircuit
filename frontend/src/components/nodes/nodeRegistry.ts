import InputNode from "./csvInputNode";
import TransformNode from "./transformNode";
import NoteNode from "./noteNode";
import DisplayNode from "./displayNode";
import HandleMissingNode from "./handleMissingValNode";
import FilterRowsNode from "./filterRowsNode";
import CombineNode from "./combineNode";
import SelectColumnNode from "./selectColumnNode";
import LoadImageNode from "./loadImageNode";
import SaveImageNode from "./saveImageNode";
import ResizeImageNode from "./resizeImageNode";
import CvtColorImageNode from "./cvtColorImageNode";
import FlipImageNode from "./flipImageNode";
import DisplayImageNode from "./displayImageNode";
import BlurImageNode from "./blurImageNode";

// This object maps the node 'type' string to its React component.
export const nodeRegistry = {
  combine: CombineNode,
  csvInput: InputNode,
  cvtColorImage: CvtColorImageNode,
  displayImage: DisplayImageNode,
  display: DisplayNode,
  filterRows: FilterRowsNode,
  flipImage: FlipImageNode,
  handleMissingVal: HandleMissingNode,
  loadImage: LoadImageNode,
  note: NoteNode,
  resizeImage: ResizeImageNode,
  saveImage: SaveImageNode,
  selectColumn: SelectColumnNode,
  transform: TransformNode,
  blurImage: BlurImageNode,
};
