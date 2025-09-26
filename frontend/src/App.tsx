import { useCallback } from 'react';
import { Background, ReactFlow, useNodesState, useEdgesState, addEdge, type Connection} from '@xyflow/react'

import InputNode from './components/nodes/InputNode';
import TransformNode from './components/nodes/TransformNode';

import './App.css'
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  inputNode: InputNode,
  transformNode: TransformNode
}

const initialNodes = [
  { id: 'n1', type:'inputNode', position: { x: 0, y: 0 }, data: { label: 'Load CSV' } },
  { id: 'n2', type:'transformNode', position: { x: 250, y: 100 }, data: { label: 'Preprocess' } },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];


function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  )

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
        <Background color='#bbb'/>
      </ReactFlow>
    </div>
  )
}

export default App
