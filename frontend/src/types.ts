import type { AppNodeData } from "./nodeTypes";

export type MenuAction = {
  label: string;
  onSelect: () => void;
};

export type ContextMenuProps = {
  top: number;
  left: number;
  actions: MenuAction[];
};

export type NodeStatus = {
  nodeType: string;
  label: string;
  description: string;
  status: 'Installed' | 'Missing Dependencies';
  missingDependencies: string[];
  defaultData: AppNodeData
};

export type PackageManagerProps = {
  onClose: () => void;
};
