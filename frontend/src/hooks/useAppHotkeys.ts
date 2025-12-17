import { useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { AppNode, AppNodeData } from "../nodeTypes";
import type { Edge } from "@xyflow/react";
import { KEYMAPS } from "../keymaps";

type UseAppHotkeysProps = {
  nodes: AppNode[];
  setNodes: (nodes: AppNode[] | ((prevNodes: AppNode[]) => AppNode[])) => void;
  edges: Edge[];
  deleteElements: (params: {
    nodes: { id: string }[];
    edges: { id: string }[];
  }) => void;
  addNode: (
    nodeType: string,
    presetData?: Partial<AppNodeData>,
    presetPosition?: { x: number; y: number },
  ) => void;
  fitView: (options?: {
    nodes?: AppNode[];
    duration?: number;
    padding?: number;
  }) => void;
  clipboard: AppNode | null;
  setClipboard: (node: AppNode | null) => void;
};

export function useAppHotkeys({
  nodes,
  setNodes,
  edges,
  deleteElements,
  addNode,
  fitView,
  clipboard,
  setClipboard,
}: UseAppHotkeysProps) {
  const clipboardRef = useRef(clipboard);
  useEffect(() => {
    clipboardRef.current = clipboard;
  }, [clipboard]);

  // Select All Hotkey
  useHotkeys(
    KEYMAPS.SELECT_ALL,
    (e) => {
      e.preventDefault();
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: true,
        })),
      );
    },
    [setNodes],
  );

  // Delete Hotkey
  useHotkeys(
    KEYMAPS.DELETE,
    (e) => {
      e.preventDefault();
      const selectedNodes = nodes.filter((n) => n.selected);
      const selectedEdges = edges.filter((e) => e.selected);

      deleteElements({
        nodes: selectedNodes,
        edges: selectedEdges,
      });
    },
    [nodes, edges, deleteElements],
  );

  // Copy Hotkey
  useHotkeys(
    KEYMAPS.COPY,
    (e) => {
      e.preventDefault();
      const selectedNode = nodes.find((n) => n.selected);
      if (selectedNode) {
        setClipboard(selectedNode);
      }
    },
    [nodes, setClipboard],
  );

  // Paste Hotkey
  useHotkeys(
    KEYMAPS.PASTE,
    (e) => {
      e.preventDefault();
      const nodeToPaste = clipboardRef.current;

      if (nodeToPaste && nodeToPaste.type) {
        addNode(
          nodeToPaste.type,
          {
            ...nodeToPaste.data,
          },
          {
            x: nodeToPaste.position.x + 20,
            y: nodeToPaste.position.y + 20,
          },
        );
      }
    },
    [addNode, clipboardRef],
  );

  // Duplicate Hotkey
  useHotkeys(
    KEYMAPS.DUPLICATE,
    (e) => {
      e.preventDefault();
      const selectedNode = nodes.find((n) => n.selected);

      if (selectedNode && selectedNode.type) {
        addNode(
          selectedNode.type,
          {
            ...selectedNode.data,
          },
          {
            x: selectedNode.position.x + 20,
            y: selectedNode.position.y + 20,
          },
        );
      }
    },
    [nodes, addNode],
  );

  // Fit to View Hotkey
  useHotkeys(
    KEYMAPS.FIT_VIEW,
    (e) => {
      e.preventDefault();
      const selectedNodes = nodes.filter((n) => n.selected);

      if (selectedNodes.length > 0) {
        fitView({
          nodes: selectedNodes,
          duration: 200,
          padding: 0.2,
        });
      } else {
        fitView({ duration: 200, padding: 0.1 });
      }
    },
    [nodes, fitView],
  );

  // ZoomIn View Hotkey
  useHotkeys(
    KEYMAPS.ZOOM_IN,
    (e) => {
      e.preventDefault();
      const selectedNodes = nodes.filter((n) => n.selected);

      if (selectedNodes.length > 0) {
        fitView({
          nodes: selectedNodes,
          duration: 200,
          padding: 0.2,
        });
      } else {
        fitView({ duration: 200, padding: 0.1 });
      }
    },
    [nodes, fitView],
  );

  // ZoomOut View Hotkey
  useHotkeys(
    KEYMAPS.ZOOM_OUT,
    (e) => {
      e.preventDefault();
      // Zoom out by fitting the view with a larger padding.
      fitView({ duration: 200, padding: 0.3 });
    },
    [fitView],
  );
}
