import InputNode from './InputNode';
import TransformNode from './TransformNode';
import NoteNode from './NoteNode';
import DisplayNode from './DisplayNode';
import HandleMissingNode from './HandleMissingNode';
import FilterRowsNode from './FilterRowsNode';

// This object maps the node 'type' string to its React component.
export const nodeRegistry = {
  inputNode: InputNode,
  transformNode: TransformNode,
  noteNode: NoteNode,
  displayNode: DisplayNode,
  handleMissingNode: HandleMissingNode,
  filterRowsNode: FilterRowsNode,
};