import { Handle, Position } from '@xyflow/react';

function TransformNode({ data }: { data: { label: string } }) {
  return (
    // Use the class name from our CSS module
    <div className="
      bg-white
      border
      border-solid
      rounded-md
      border-[#1a192b]
      w-[180px]
      shadow-md
    ">
      {/* A distinct header for the node title */}
      <div className="
        bg-[#5a5a5a]
        py-2
        px-4
        rounded-t-sm
        font-bold
        text-white
      ">
        {data.label}
      </div>

      {/* A body for any future content or controls */}
      <div className="
        p-4
        text-center
      ">
        Transform Data
      </div>

      {/* Handles with unique IDs */}
      <Handle id="a" type="source" position={Position.Right} />
      <Handle id="b" type="target" position={Position.Left} />
    </div>
  );
}

export default TransformNode;