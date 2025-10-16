import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Background,
  ReactFlow,
  useReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type ColorMode,
  Controls,
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

import '@xyflow/react/dist/style.css';
import './App.css'
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
  const [isPanning, setIsPanning] = useState(false);
  const flow = useReactFlow();

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

  // Enable spacebar-to-pan interaction: hold Space to pan the viewport
  useEffect(() => {
    let spaceDown = false;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spaceDown) {
        const active = document.activeElement as HTMLElement | null;
        const tag = active?.tagName;
        // don't hijack space when typing into inputs
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || active?.isContentEditable) return;
        e.preventDefault();
        spaceDown = true;
        setIsPanning(true);
        document.body.style.cursor = 'grab';
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && spaceDown) {
        spaceDown = false;
        setIsPanning(false);
        document.body.style.cursor = '';
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.body.style.cursor = '';
    };
  }, []);

  // Wire up custom events to the ReactFlow instance (zoom)
  useEffect(() => {
    const onZoomEvent = (e: Event) => {
      const custom = e as CustomEvent<{ delta: number }>;
      try {
        if (custom?.detail?.delta) {
          const { delta } = custom.detail;
          const currentZoom = (typeof flow.getZoom === 'function') ? flow.getZoom() : 1;
          const newZoom = currentZoom + delta;
          if (typeof flow.getViewport === 'function' && typeof flow.setViewport === 'function') {
            const vp = flow.getViewport();
            flow.setViewport({ x: vp.x, y: vp.y, zoom: newZoom });
          }
        }
      } catch {
        // ignore when flow is not ready
      }
    };

    window.addEventListener('xyflow-zoom', onZoomEvent as EventListener);
    return () => window.removeEventListener('xyflow-zoom', onZoomEvent as EventListener);
  }, [flow]);

  const onConnect = useCallback(
    (connection: Connection) => {
      // Use functional update so we always work with the latest edges
      const newEdge = {
        ...connection,
        // style: { 
        //   stroke: colorMode === 'dark' ? 'green' : '#000000',
        //   stroke: colorMode === 'dark' ? 'limegreen' : '#000000',
        //   strokeWidth: 2
        // },
      }
      setEdges((eds) => {
        const newEdges = addEdge(newEdge, eds);

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
          panOnDrag={isPanning}
          panOnScroll={true}
          selectionOnDrag={true}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onPaneContextMenu={paneContextMenu}
          onPaneClick={paneClick}
          colorMode={colorMode}
          proOptions={
            {hideAttribution:true}
          }
          fitView
        >
          {/* <Background color='#bbb' /> */}
          <Background className="bg-white dark:bg-gray-900" />
          <Controls />
        </ReactFlow>
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-md p-1 shadow-2xl opacity-50 hover:opacity-100 transition-opacity">
            <button
              onClick={() => setPackageManagerOpen(true)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-medium py-1 px-3 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Manage
            </button>

            <button
              onClick={handleRunClick}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Run
            </button>

            <ThemeToggle colorMode={colorMode} setColorMode={setColorMode} />
          </div>

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

      {/* MODAL */}
      {isPackageManagerOpen && <PackageManager onClose={() => setPackageManagerOpen(false)} />}


    </div >
  )
}

export default App
