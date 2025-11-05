// src/nodeTypes.ts

import type { Node } from "@xyflow/react";

type ColorSpace = "GRAY" | "BGR" | "RGB" | "HSV" | "LAB";

export type CommonNodeData = {
  onChange: (id: string, data: object) => void;
  isError?: boolean;
  category?: string;
  description?: string;
};

// INPUT NODE
export type InputNodeData = {
  label: string;
  filePath: string;
  file?: File | null;
  accept?: string;
} & CommonNodeData;

export type InputNodeProps = {
  data: InputNodeData;
  id: string;
};

// TRANSFORM NODE
export type TransformNodeData = {
  label: string;
  method: "normalize" | "standardize" | "pca";
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
  strategy: "mean" | "median" | "most_frequent" | "constant";
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
  columns: string;
  inputColumns?: string[];
} & CommonNodeData;

export type SelectColumnProps = {
  data: SelectColumnData;
  id: string;
};

// LoadImage NODE
export type LoadImageNodeData = {
  label: string;
} & CommonNodeData;

export type LoadImageNodeProps = {
  data: LoadImageNodeData;
  id: string;
};

// SaveImage Node
export type SaveImageNodeData = {
  label: string;
  filePath: string;
  // 'accept' from manifest isn't directly used in UI but kept for data consistency
  accept?: string;
} & CommonNodeData;

export type SaveImageNodeProps = {
  data: SaveImageNodeData;
  id: string;
};

// ResizeImage Node
export type ResizeImageNodeData = {
  label: string;
  width: number;
  height: number;
} & CommonNodeData;

export type ResizeImageNodeProps = {
  data: ResizeImageNodeData;
  id: string;
};

// ResizeImage Node
export type CvtColorImageNodeData = {
  label: string;
  in_colorspace: ColorSpace;
  out_colorspace: ColorSpace;
} & CommonNodeData;

export type CvtColorImageNodeProps = {
  data: CvtColorImageNodeData;
  id: string;
};

// FlipImage Node
export type FlipImageNodeData = {
  label: string;
  horizontal: boolean;
  vertical: boolean;
} & CommonNodeData;

export type FlipImageNodeProps = {
  data: FlipImageNodeData;
  id: string;
};

// DISPLAY_IMAGE NODE
export type DisplayImageNodeData = {
  label: string;
  imageBase64?: string;
} & CommonNodeData;

export type DisplayImageNodeProps = {
  data: DisplayImageNodeData;
  id: string;
};

// BLUR_IMAGE NODE
export type BlurImageNodeData = {
  label: string;
  blurType: "GAUSSIAN" | "MEDIA" | "BILATERAL";
  kernelSize: number;
} & CommonNodeData;

export type BlurImageNodeProps = {
  data: BlurImageNodeData;
  id: string;
};

// CANNY_EDGE NODE
export type CannyEdgeNodeData = {
  label: string;
  threshold1: number;
  threshold2: number;
} & CommonNodeData;

export type CannyEdgeNodeProps = {
  data: CannyEdgeNodeData;
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
  | SelectColumnData
  | LoadImageNodeData
  | SaveImageNodeData
  | ResizeImageNodeData
  | CvtColorImageNodeData
  | FlipImageNodeData
  | DisplayImageNodeData
  | BlurImageNodeData
  | CannyEdgeNodeData;

// A final AppNode type that uses our custom data type
export type AppNode = Node<AppNodeData>;
