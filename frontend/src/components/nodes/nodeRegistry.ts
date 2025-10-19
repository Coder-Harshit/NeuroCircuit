import InputNode from './InputNode';
import TransformNode from './TransformNode';
import NoteNode from './NoteNode';
import DisplayNode from './DisplayNode';
import HandleMissingNode from './HandleMissingNode';
import FilterRowsNode from './FilterRowsNode';
import CombineNode from './CombineNode';
import SelectColumnNode from './SelectColumnNode';
import LoadImageNode from './LoadImageNode';
import SaveImageNode from './SaveImageNode';

// This object maps the node 'type' string to its React component.
export const nodeRegistry = {
  inputNode: InputNode,
  transformNode: TransformNode,
  noteNode: NoteNode,
  displayNode: DisplayNode,
  handleMissingNode: HandleMissingNode,
  filterRowsNode: FilterRowsNode,
  combineNode: CombineNode,
  selectColumnNode: SelectColumnNode,
  loadImageNode: LoadImageNode,
  saveImageNode: SaveImageNode,
};