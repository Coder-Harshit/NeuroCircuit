import { Handle, Position } from '@xyflow/react';
import type { ChangeEvent } from 'react';
import type { InputNodeProps } from '../../types';

function InputNode({ id, data }: InputNodeProps ) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>)=> {
        data.onChange(id,{filePath: event.target.value});
    };

  return (
    <div className="bg-white border border-slate-300 rounded-md w-[250px] shadow-md">
      <div className="bg-sky-200 py-2 px-4 rounded-t-md font-bold text-slate-700">
        {data.label}
      </div>
      <div className="p-4">
        <label htmlFor="filePath" className="block text-sm font-medium text-slate-600 mb-1">
          File Path
       </label>
        <input
          id="filePath"
          name="filePath"
          value={data.filePath ?? ''}
          onChange={handleChange}
          className="nodrag w-full p-1 border border-slate-400 rounded-sm"
        />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default InputNode;