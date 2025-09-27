import { useCallback, useEffect } from 'react';
import { Background, ReactFlow, useNodesState, useEdgesState, addEdge, type Connection, type Edge } from '@xyflow/react'

import InputNode from './components/nodes/InputNode';
import TransformNode from './components/nodes/TransformNode';
import NoteNode from './components/nodes/NoteNode';

import './App.css'
import '@xyflow/react/dist/style.css';
import type { AppNode } from './types';

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

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
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
      >
        <Background color='#bbb' />
      </ReactFlow>
    </div>
  )
}

export default App
