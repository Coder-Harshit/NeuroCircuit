import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge
} from '@xyflow/react'
import { v4 as uuidv4 } from 'uuid';

import { nodeRegistry } from './components/nodes/nodeRegistry';
import ContextMenu from './components/ui/ContextMenu';
import PackageManager from './components/ui/PackageManager';

import type {
  AppNode,
  AppNodeData,
} from './nodeTypes';
import type { NodeStatus } from './types';

import './App.css'
import '@xyflow/react/dist/style.css';


const nodeTypes = nodeRegistry;

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // state will be null when the menu is closed, or an object with its position when it's open.
  const [menu, setMenu] = useState<{ id: string, top: number, left: number } | null>(null);
  const [isPackageManagerOpen, setPackageManagerOpen] = useState(false);

  const [availableNodes, setAvailableNodes] = useState<NodeStatus[]>([]);
  const [displayData, setDisplayData] = useState<Record<string, string>>({});


  useEffect(() => {
    const fetchAvailableNodes = async () => {
      try {
        const resp = await fetch('http://127.0.0.1:8000/nodes/status');
        const data: NodeStatus[] = await resp.json();
        setAvailableNodes(data.filter(
          node => node.status === 'Installed'
        ))
      } catch (err) {
        console.error("Failed to fetch available nodes: ", err);
      }
    }
    fetchAvailableNodes();
  }, [isPackageManagerOpen]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  const onNodeDataChange = useCallback(
    (nodeId: string, newData: object) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const addNode = useCallback(
    (nodeType: string) => {
      if (!menu) return;

      const nodeBlueprint = availableNodes.find(
        n => n.nodeType === nodeType
      );
      if (!nodeBlueprint) {
        console.error(`Blueprint for node type "${nodeType}" not found.`);
        return
      };

      const newId = uuidv4();

      const newNode: AppNode = {
        id: newId,
        type: nodeType,
        position: {
          x: menu.left,
          y: menu.top,
        },
        data: {
          ...nodeBlueprint.defaultData,
          onChange: onNodeDataChange
        } as AppNodeData,
      };
      setNodes((currentNodes) => [...currentNodes, newNode]);
      setMenu(null);
    },
    [menu, onNodeDataChange, setNodes, availableNodes]
  );

  const paneContextMenu = useCallback(
    (evt: MouseEvent | React.MouseEvent) => {
      evt.preventDefault();
      setMenu({
        id: 'add-node-menu',
        top: evt.clientY,
        left: evt.clientX
      });
    },
    [setMenu]
  )

  const paneClick = useCallback(
    () => {
      setMenu(null);
    },
    [setMenu]
  )

  const handleRunClick = useCallback(async () => {
    // extract just the data needed for backend
    const graphData = {
      nodes:
        nodes
          .filter(({ type }) => type !== 'noteNode') //Note Nodes (CommentNodes) are useless to backend
          .map(({ id, type, position, data }) => {
            const restData = { ...data };
            delete (restData as any).onChange;
            return { id, type, position, data: restData };
          }),
      edges: edges,
    };

    try {
      const resp = await fetch("http://127.0.0.1:8000/execute", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(graphData),
      });
      const res = await resp.json();
      console.log('Response from backend:', res);
      if (res.output) {
        setDisplayData(res.output);
      }
    } catch (error) {
      console.error('Error sending graph to backend:', error);
    }
  }, [nodes, edges]);

  // Use useMemo to inject display data into the nodes before rendering
  // This is an efficient way to derive state
  const nodesWithData = useMemo(() => {
    return nodes.map((node) => {
      if (node.type === 'displayNode' && displayData[node.id]) {
        return {
          ...node,
          data: {
            ...node.data,
            result: displayData[node.id],
          },
        };
      }
      return node;
    });
  }, [nodes, displayData]);



  return (
    <div className='flex flex-col h-screen w-screen'>
      <div className='flex flex-grow h-full w-full relative'>
        <ReactFlow
          nodes={nodesWithData}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          panOnDrag={false}
          panOnScroll={true}
          selectionOnDrag={true}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          onPaneContextMenu={paneContextMenu}
          onPaneClick={paneClick}
        >
          <Background color='#bbb' />
        </ReactFlow>

        <div className="absolute top-4 right-4 z-10 space-x-2">
          <button
            onClick={() => setPackageManagerOpen(true)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Manage Packages
          </button>
          <button
            onClick={handleRunClick}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Run
          </button>
        </div>

      </div>

      {menu && (
        <ContextMenu
          top={menu.top}
          left={menu.left}
          actions={availableNodes.map(node => ({
            label: node.label,
            onSelect: () => {
              addNode(node.nodeType);
              setMenu(null);
            }
          }))}
        />
      )}

      {/* MODAL */}
      {isPackageManagerOpen && <PackageManager onClose={() => setPackageManagerOpen(false)} />}

    </div>
  )
}

export default App
