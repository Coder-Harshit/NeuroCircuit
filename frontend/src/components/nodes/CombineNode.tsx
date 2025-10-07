// frontend/src/components/nodes/combineNode.tsx

import { Handle, Position } from '@xyflow/react';
import type { CombineNodeProps } from '../../nodeTypes';

function combineNode({ id, data }: CombineNodeProps) {
  const handleAxisChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newAxis = parseInt(event.target.value, 10);
    data.onChange(id, { ...data, axis: newAxis });
  };

  return (
    <div className="bg-white border border-slate-400 rounded-md w-[200px] shadow-md">
      <div className="bg-green-200 py-2 px-4 rounded-t-md font-bold text-slate-700">
        {data.label}
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm">Concatenate along:</p>
        <select
          value={data.axis}
          onChange={handleAxisChange}
          aria-label="Concatenate axis"
          className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <option value={0}>Rows (Vertical)</option>
          <option value={1}>Columns (Horizontal)</option>
        </select>
      </div>
      <Handle type="source" position={Position.Right} />
      <Handle id="a" type="target" position={Position.Left} style={{ top: '33%' }} />
      <Handle id="b" type="target" position={Position.Left} style={{ top: '66%' }} />
    </div>
  );
}

export default combineNode;