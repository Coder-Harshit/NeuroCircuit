import { Handle, Position } from '@xyflow/react';

// The 'data' prop is passed from your node definition.
// It contains the label and any other custom data.
function InputNode({ data }: { data: { label: string } }) {
  return (
    <div className="
      bg-slate-100
      border
      border-slate-300
      py-2
      px-4
      rounded-md
      w-[180px]
      text-center
      text-sm
      shadow-md
    ">
      <div>{data.label}</div>
      {/* This is the connection point (the handle) */}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default InputNode;