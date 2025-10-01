// src/nodeTypes.ts

import type { Node } from '@xyflow/react';

// INPUT NODE
export type InputNodeData = {
  label: string;
  filePath: string;
  onChange: (id: string, data: object) => void;
};
export type InputNodeProps = {
    data: InputNodeData;
    id: string;
};


// TRANSFORM NODE
export type TransformNodeData = {
  label: string;
  method: 'normalize' | 'standardize' | 'pca';
  onChange: (id: string, data: object) => void;
};
export type TransformNodeProps = {
    data: TransformNodeData;
    id: string;
};


// NOTE NODE
export type NoteNodeData = {
  label: string;
  onChange: (id: string, data: object) => void;
};
export type NoteNodeProps = {
    data: NoteNodeData;
    id: string;
};


// DISPLAY NODE
export type DisplayNodeData = {
  label: string;
  result?: string; // JSON String
};

export type DisplayNodeProps = {
    data: DisplayNodeData;
    id: string;
};


// HANDLE_MISSING NODE
export type HandleMissingNodeData = {
  label: string;
  strategy: 'mean' | 'median' | 'most_frequent' | 'constant';
  onChange: (id: string, data: object) => void;
};

export type HandleMissingNodeProps = {
    data: HandleMissingNodeData;
    id: string;
};


// FILTER_ROWS NODE
export type FilterRowsNodeData = {
  label: string;
  column: string;
  operator: string;
  value: string;
  onChange: (id: string, data: object) => void;
};

export type FilterRowsNodeProps = {
    data: FilterRowsNodeData;
    id: string;
};

export type AppNodeData = 
  | InputNodeData
  | TransformNodeData
  | NoteNodeData
  | DisplayNodeData
  | HandleMissingNodeData
  | FilterRowsNodeData;

// A final AppNode type that uses our custom data type
export type AppNode = Node<AppNodeData>;