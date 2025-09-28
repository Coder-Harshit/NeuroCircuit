import { useCallback, useEffect, useState } from 'react';
import { Background, ReactFlow, useNodesState, useEdgesState, addEdge, type Connection, type Edge } from '@xyflow/react'

import InputNode from './components/nodes/InputNode';
import TransformNode from './components/nodes/TransformNode';
import NoteNode from './components/nodes/NoteNode';

import type { AppNode, AppNodeData, InputNodeData, TransformNodeData } from './nodeTypes';

import ContextMenu from './components/ui/ContextMenu';

import { v4 as uuidv4 } from 'uuid';

import './App.css'
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  inputNode: InputNode,
  transformNode: TransformNode,
  noteNode: NoteNode,
};

const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

const createInitialNodes = (
  onNodeDataChange: (id: string, newData: object) => void
): AppNode[] => [
    {
      id: 'n1',
      type: 'inputNode',
      position: { x: 0, y: 0 },
      data: {
        label: 'Load CSV',
        filePath: '',
        onChange: onNodeDataChange,
      },
    },
    {
      id: 'n2',
      type: 'transformNode',
      position: { x: 250, y: 100 },
      data: {
        label: 'Preprocess',
        method: 'normalize',
        onChange: onNodeDataChange,
      },
    },
    {
      id: 'n3',
      type: 'noteNode',
      position: { x: 550, y: 150 },
      data: {
        label: 'Comment Here',
        onChange: onNodeDataChange,
      },
    },
  ];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  // state will be null when the menu is closed, or an object with its position when it's open.
  const [menu, setMenu] = useState<{ id: string, top: number, left: number } | null>(null);

  // // when we would be storing the nodes within the local storage we would be needing to save this counter value also ... 

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

  useEffect(() => {
    setNodes(createInitialNodes(onNodeDataChange));
  }, [onNodeDataChange, setNodes]);

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

  const addNode = useCallback(
    (nodeType: string) => {
      if (!menu) return;

      const newId = uuidv4();

      let nodeData: AppNodeData;

      switch (nodeType) {
        case 'inputNode':
          nodeData = { label: 'New Input', filePath: '', onChange: onNodeDataChange };
          break;
        case 'transformNode':
          nodeData = { label: 'New Transform', method: 'normalize', onChange: onNodeDataChange };
          break;
        case 'noteNode':
          nodeData = { label: 'New Note', onChange: onNodeDataChange };
          break;
        default:
          throw new Error("Unknown node type selected");
      }

      const newNode: AppNode = {
        id: newId,
        type: nodeType,
        position: {
          x: menu.left,
          y: menu.top,
        },
        data: nodeData,
      };
      setNodes((currentNodes) => [...currentNodes, newNode]);
      setMenu(null);
    },
    [menu, onNodeDataChange, setNodes]
  );

  const handleRunClick = useCallback(() => {
    // extract just the data needed for backend
    const graphData = {
      nodes:
        nodes
          .filter(({type}) => type!=='noteNode') //Note Nodes (CommentNodes) are useless to backend
          .map(({ id, type, position, data }) => ({
            id,
            type,
            position,
            data: {
              label: data.label,
              filePath: (data as InputNodeData).filePath,
              method: (data as TransformNodeData).method,
            },
          })),
      edges: edges,
    };

    console.log("Graph Ready for Backend:", JSON.stringify(graphData, null, 2));
  }, [nodes, edges]);

  return (
    <div className='flex flex-col h-screen w-screen'>
      <header className="p-2 border-b-2 border-slate-200 bg-slate-50">
        <button
          onClick={handleRunClick}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-4 rounded"
        >
          Run
        </button>
      </header>

      <div className='flex flex-grow'>
        <ReactFlow
          nodes={nodes}
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
      </div>

      {menu && (
        <ContextMenu
          top={menu.top}
          left={menu.left}
          actions={[
            {
              label: 'Input Node',
              onSelect: () => {
                addNode('inputNode')
                setMenu(null)
              }
            },
            {
              label: 'Transform Node',
              onSelect: () => {
                addNode('transformNode')
                setMenu(null)
              }
            },
            {
              label: 'Note Node',
              onSelect: () => {
                addNode('noteNode')
                setMenu(null)
              }
            },
          ]}
        />
      )}
    </div>
  )
}

export default App
