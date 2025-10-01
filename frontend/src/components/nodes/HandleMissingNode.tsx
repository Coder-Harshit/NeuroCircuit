import { Handle, Position } from '@xyflow/react';
import type { ChangeEvent } from 'react';
import type { HandleMissingNodeProps } from '../../nodeTypes';

function HandleMissingNode({id, data}: HandleMissingNodeProps) {

  const handleChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    data.onChange?.(id, { strategy: evt.target.value });
  };

  return (
    <div className="bg-white border border-slate-400 rounded-md w-[200px] shadow-md">
      <div className="bg-orange-200 py-2 px-4 rounded-t-md font-bold text-slate-700">
        {data.label}
      </div>
      <div className="p-4">
        <label htmlFor="strategy" className="block text-sm font-medium text-slate-600 mb-1">
          Strategy
        </label>
        <select
          id="strategy"
          name="strategy"
          value={data.strategy}
          onChange={handleChange}
          className="nodrag w-full p-1 border border-slate-400 rounded-sm"
        >
          <option value="mean">Mean</option>
          <option value="median">Median</option>
          <option value="most_frequent">Most Frequent</option>
          <option value="constant">Constant (fill with 0)</option>
        </select>
      </div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
export default HandleMissingNode;