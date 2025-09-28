export type MenuAction = {
  label: string;
  onSelect: () => void;
};

export type ContextMenuProps = {
  top: number;
  left: number;
  actions: MenuAction[];
};
