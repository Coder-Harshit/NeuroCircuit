import InputNode from './InputNode';
import TransformNode from './TransformNode';
import NoteNode from './NoteNode';
import DisplayNode from './DisplayNode';

// This object maps the node 'type' string to its React component.
export const nodeRegistry = {
  inputNode: InputNode,
  transformNode: TransformNode,
  noteNode: NoteNode,
  displayNode: DisplayNode,
};