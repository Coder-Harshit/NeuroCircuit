import { useCallback, useEffect } from 'react';
import { Background, ReactFlow, useNodesState, useEdgesState, addEdge, type Connection, type Node, type Edge } from '@xyflow/react'

import InputNode from './components/nodes/InputNode';
import TransformNode from './components/nodes/TransformNode';

import './App.css'
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  inputNode: InputNode,
  transformNode: TransformNode
}

const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

const createInitialNodes = (
  onNodeDataChange: (id: string, newFilePath: string) => void
): Node[] => [
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
      },
    },
  ];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

  const onNodeDataChange = useCallback(
    (nodeId: string, newfilePath: string) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                filePath: newfilePath,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );


  // 👇 only set once when app mounts
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
