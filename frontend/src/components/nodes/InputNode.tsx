import { Handle, Position } from '@xyflow/react';

// The 'data' prop is passed from your node definition.
// It contains the label and any other custom data.
function InputNode({ data }: { data: { label: string } }) {
  return (
    <div style={{
      background: '#f0f0f0',
      border: '1px solid #ddd',
      padding: '10px 15px',
      borderRadius: '5px',
      width: '180px',
      textAlign: 'center',
      fontSize: '14px',
    }}>
      <div>{data.label}</div>
      {/* This is the connection point (the handle) */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default InputNode;