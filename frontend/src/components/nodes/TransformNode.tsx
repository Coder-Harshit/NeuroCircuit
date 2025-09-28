import { Handle, Position } from '@xyflow/react';
import type { ChangeEvent } from 'react';
import type { TransformNodeProps } from '../../nodeTypes';

function TransformNode({ id, data }: TransformNodeProps) {
  
  const handleChange = (evt: ChangeEvent<HTMLSelectElement>)=>{
    data.onChange(id, {method: evt.target.value});
  };
  
  return (
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

       <div className="p-4">
        <label htmlFor="method" className="block text-sm font-medium text-slate-600 mb-1">
          Method
        </label>
        <select
          id="method"
          name="method"
          value={data.method}
          onChange={handleChange}
          className="nodrag w-full p-1 border border-slate-400 rounded-sm"
        >
          <option value="normalize">Normalize</option>
          <option value="standardize">Standardize</option>
          <option value="pca">PCA</option>
        </select>
      </div>

      <Handle id="a" type="source" position={Position.Right} />
      <Handle id="b" type="target" position={Position.Left} />
    </div>
  );
}

export default TransformNode;
