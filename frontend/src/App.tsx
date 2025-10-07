import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type ColorMode,
  Controls
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
import { ThemeToggle } from './components/ui/ThemeToggle';


const localKey = "neurocircuit-flow";
const themeKey = "neurocircuit-theme";


const nodeTypes = nodeRegistry;

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [nodeSchemas, setNodeSchemas] = useState<Record<string, string[]>>({});

  // state will be null when the menu is closed, or an object with its position when it's open.
  const [menu, setMenu] = useState<{
    id: string,
    top: number,
    left: number
  } | null>(null);

  const [isPackageManagerOpen, setPackageManagerOpen] = useState(false);
  const [availableNodes, setAvailableNodes] = useState<NodeStatus[]>([]);
  const [displayData, setDisplayData] = useState<Record<string, string>>({});

  // Get preferred theme from local storage or system preference
  const getInitialColorMode = (): ColorMode => {
    const savedTheme = localStorage.getItem(themeKey) as ColorMode;
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [colorMode, setColorMode] = useState<ColorMode>(getInitialColorMode);

  // EFFECT to toggle the 'dark' class on the HTML element
  useEffect(() => {
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(themeKey, colorMode); // Save theme preference
  }, [colorMode]);

  // Load the state from local storage on initial render
  useEffect(() => {
    const restoreFlow = () => {
      const flow = JSON.parse(localStorage.getItem(localKey) || "null");

      if (flow) {
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
      }
    };

    restoreFlow();
  }, [setEdges, setNodes]);

  // Save the state to local storage whenever nodes or edges change
  useEffect(() => {
    const saveFlow = () => {
      const flow = {
        nodes: nodes,
        edges: edges,
      };
      localStorage.setItem(localKey, JSON.stringify(flow));
    };

    // If the graph is empty, remove any saved flow. Otherwise save the current flow.
    if (nodes.length === 0 && edges.length === 0) {
      localStorage.removeItem(localKey);
    } else {
      saveFlow();
    }
  }, [nodes, edges]);

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
    (connection: Connection) => {
      // Use functional update so we always work with the latest edges
      setEdges((eds) => {
        const newEdges = addEdge(connection, eds);

        if (connection.target) {
          // fire-and-forget async inspect using the up-to-date edge list
          (async () => {
            try {
              // sanitize nodes: remove functions (like onChange) before sending to backend
              const sanitizedNodes = nodes.map(({ id, type, position, data }) => {
                const restData = { ...(data as Record<string, unknown>) };
                // remove function references before sending to backend
                delete (restData as Record<string, unknown>)['onChange'];
                return { id, type, position, data: restData };
              });

              const resp = await fetch('http://127.0.0.1:8000/inspect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  nodes: sanitizedNodes,
                  edges: newEdges,
                  targetNodeId: connection.target,
                }),
              });

              if (!resp.ok) throw new Error(`Inspect failed ${resp.status}`);
              const data = await resp.json();
              setNodeSchemas((prevSchemas) => ({
                ...prevSchemas,
                [connection.target!]: data.columns || [],
              }));
            } catch (error) {
              console.error('Failed to inspect node:', error);
            }
          })();
        }

        return newEdges;
      });
    },
    [nodes, setEdges]
  );


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
          ...(nodeBlueprint.defaultData || {}),
          onChange: onNodeDataChange,
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
        const restData = { ...(data as Record<string, unknown>) };
        delete (restData as Record<string, unknown>)['onChange'];
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
      const baseData = {
        ...node.data,
        onChange: onNodeDataChange,
        inputColumns: nodeSchemas[node.id] || [],
      } as AppNodeData;

      // Merge result into the base data for display nodes while preserving onChange/inputColumns
      const mergedData = node.type === 'displayNode' && displayData[node.id]
        ? { ...baseData, result: displayData[node.id] }
        : baseData;

      return {
        ...node,
        data: mergedData,
      };
    });
  }, [nodes, onNodeDataChange, nodeSchemas, displayData]);



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
          onPaneContextMenu={paneContextMenu}
          onPaneClick={paneClick}
          colorMode={colorMode}
          fitView
        >
          {/* <Background color='#bbb' /> */}
          <Background className="bg-white dark:bg-gray-900" />
          <Controls />
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
          
          <ThemeToggle colorMode={colorMode} setColorMode={setColorMode} />


      </div>

    </div>

      {
    menu && (
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
    )
  }

  {/* MODAL */ }
  { isPackageManagerOpen && <PackageManager onClose={() => setPackageManagerOpen(false)} /> }


    </div >
  )
}

export default App
