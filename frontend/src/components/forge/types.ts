export type IOType = "IMAGE" | "DATAFRAME" | "STRING" | "NUMBER" | "ANY";
export type ParamType = "string" | "number" | "boolean" | "select";

export interface NodeInput {
  name: string;
  type: IOType;
}

export interface NodeOutput {
  name: string;
  type: IOType;
}

export interface NodeParam {
  name: string;
  type: ParamType;
  default: string | number | boolean;
}

export interface NodeManifest {
  nodeType: string;
  label: string;
  category: string;
  description: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  params: NodeParam[];
}