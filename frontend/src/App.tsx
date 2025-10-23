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
  // MarkerType,
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
import { triggerBrowserDownload } from './utils/trigDownload';


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
  const [error, setError] = useState<{ nodeId: string; message: string } | null>(null);


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
    setError(null) // Clear previous errors on a new run

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

      if (res.status === 'error') {
        setError({ nodeId: res.errorNodeId, message: res.message });
        return; // Stop the rest of the processing as soon as first error is encountered
      }

      if (res.output) {
        setDisplayData(res.output);
      }

      if (res.download_files && Array.isArray(res.download_files)) {
        res.download_files.forEach((filename: string) => {
          console.log(`Triggering download for: ${filename}`);
          triggerBrowserDownload(filename);
        });
      }
      
    } catch (error) {
      console.error('Error sending graph to backend:', error);
      // You could set a generic error here if the server is unreachable
      setError({ nodeId: '', message: 'Could not connect to the backend executor.' });
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

      let mergedData: AppNodeData = baseData;

      // 1. Check for *table* display data (displayNode)
      if (node.type === 'displayNode' && displayData[node.id]) {
        mergedData = { ...baseData, result: displayData[node.id] };
      }
      // 2. Check for *image* display data (displayImageNode)
      else if (node.type === 'displayImageNode' && displayData[node.id]) {
        // The backend puts the base64 string into displayData[node.id]
        mergedData = { ...baseData, imageBase64: displayData[node.id] };
      }
      
      const nodeError = (error && node.id === error.nodeId) ? error.message : undefined;

      return {
        ...node,
        data: {
          ...mergedData,
          isError: !!nodeError,
          errorMessage: nodeError,
        },
      };
    });
  }, [nodes, onNodeDataChange, nodeSchemas, displayData, error]);


  // const defaultEdgeOptions = {
  //   type: 'smoothstep',
  //   markerEnd: {
  //       type: MarkerType.ArrowClosed,
  //       color: 'var(--color-edge)',
  //   },
  //   style: {
  //       stroke: 'var(--color-edge)',
  //   },
// };

  return (
    <div className='h-screen w-screen bg-[var(--color-surface-1)] text-[var(--color-text-1)]'>
      {/* === ERROR BANNER === */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl p-4 rounded-lg shadow-xl bg-[var(--color-danger-surface)] border border-[var(--color-danger-border)] text-[var(--color-danger-text)]">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {/* Simple Error Icon */}
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-grow">
              <h3 className="text-sm font-bold">Execution Failed</h3>
              <p className="mt-1 text-sm">{error.message}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 p-1 rounded-md hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-danger-surface)] focus-visible:ring-white"
            >
              <span className="sr-only">Dismiss</span>
              {/* Close Icon */}
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
            </button>
          </div>
        </div>
      )}
      {/* ==================== */}
      
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
          // defaultEdgeOptions={defaultEdgeOptions}
          onPaneClick={paneClick}
          colorMode={colorMode}
          proOptions={
            { hideAttribution: true }
          }
          fitView
        >
          {/* <Background color='#bbb' /> */}
          <Background color={colorMode === 'dark' ? '#334155' : '#d1d5db'} gap={16} />
          <Controls />
        </ReactFlow>
        {/* === UI CONTROLS PANEL === */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-[var(--color-surface-2)]/80 p-2 shadow-lg backdrop-blur-sm border border-[var(--color-border-1)]">
          <button
            onClick={() => setPackageManagerOpen(true)}
            className="bg-[var(--color-surface-3)] hover:bg-[var(--color-border-1)] text-[var(--color-text-2)] font-medium py-2 px-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          >
            Manage Nodes
          </button>

          <button
            onClick={handleRunClick}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            Run Pipeline
          </button>

          <ThemeToggle colorMode={colorMode} setColorMode={setColorMode} />
        </div>
        {/* ========================== */}

      </div>

      {
        menu && (
          <ContextMenu
            top={menu.top}
            left={menu.left}
            onClose={() => setMenu(null)}
            actions={availableNodes.map(node => ({
              label: node.label,
              category: node.category,
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
    </div>
  )
}

export default App
