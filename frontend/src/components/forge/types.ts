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
  options?: string[];
}

export interface ForgeState {
  nodeType: string;
  label: string;
  category: string;
  description: string;
  dependencies: string[];
  inputs: NodeInput[];
  outputs: NodeOutput[];
  params: NodeParam[];
  isCommunity: boolean; 
}

export interface SavedManifest {
  nodeType: string;
  label: string;
  category: string;
  description: string;
  dependencies: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultData: Record<string, any>;
}