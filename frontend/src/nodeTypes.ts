// src/nodeTypes.ts

import type { Node } from '@xyflow/react';

export type CommonNodeData = {
  onChange: (id: string, data: object) => void;
  isError?: boolean;
}


// INPUT NODE
export type InputNodeData = {
  label: string;
  filePath: string;
} & CommonNodeData;

export type InputNodeProps = {
  data: InputNodeData;
  id: string;
};


// TRANSFORM NODE
export type TransformNodeData = {
  label: string;
  method: 'normalize' | 'standardize' | 'pca';
} & CommonNodeData;

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
  isError?: boolean;
};

export type DisplayNodeProps = {
  data: DisplayNodeData;
  id: string;
};



// HANDLE_MISSING NODE
export type HandleMissingNodeData = {
  label: string;
  strategy: 'mean' | 'median' | 'most_frequent' | 'constant';
} & CommonNodeData;

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
} & CommonNodeData;

export type FilterRowsNodeProps = {
  data: FilterRowsNodeData;
  id: string;
};


// Combine NODE
export type CombineNodeData = {
  label: string;
  axis: 0 | 1;
} & CommonNodeData;

export type CombineNodeProps = {
  data: CombineNodeData;
  id: string;
};

// SelectColumn NODE
export type SelectColumnData = {
  label: string;
  columns: string
  inputColumns?: string[]
} & CommonNodeData;

export type SelectColumnProps = {
  data: SelectColumnData;
  id: string;
};



export type AppNodeData =
  | InputNodeData
  | TransformNodeData
  | NoteNodeData
  | DisplayNodeData
  | HandleMissingNodeData
  | FilterRowsNodeData
  | CombineNodeData
  | SelectColumnData;

// A final AppNode type that uses our custom data type
export type AppNode = Node<AppNodeData>;