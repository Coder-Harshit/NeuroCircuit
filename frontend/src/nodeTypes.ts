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


export type AppNodeData = InputNodeData | TransformNodeData | NoteNodeData | DisplayNodeData;

// A final AppNode type that uses our custom data type
export type AppNode = Node<AppNodeData>;