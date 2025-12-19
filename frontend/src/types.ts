import type { AppNodeData } from "./nodeTypes";

export type MenuAction = {
  label: string;
  onSelect: () => void;
  category?: string;
  description?: string;
};

export type SearchSettings = {
  fuzzy: boolean;
  delay: number;
};

export type ContextMenuProps = {
  top: number;
  left: number;
  actions: MenuAction[];
  onClose: () => void;
  searchSettings: SearchSettings;
};

export type NodeStatus = {
  nodeType: string;
  label: string;
  description: string;
  category?: string;
  status: "Installed" | "Missing Dependencies" | "Available";
  dependencies: string[];
  missingDependencies: string[];
  defaultData: AppNodeData;
};

export type PackageManagerProps = {
  onClose: () => void;
};
