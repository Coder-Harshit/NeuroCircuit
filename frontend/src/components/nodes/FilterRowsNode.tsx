import { Handle, Position } from '@xyflow/react';
import { type FilterRowsNodeProps } from '../../nodeTypes'; // We'll add this type

function FilterRowsNode({id, data}: FilterRowsNodeProps) {

  // A generic handler to update any of the three values
  const handleChange = (field: string, value: string) => {
    data.onChange?.(id, { [field]: value });
  };

  return (
    <div className="bg-white border border-slate-400 rounded-md w-[250px] shadow-md">
      <div className="bg-blue-200 py-2 px-4 rounded-t-md font-bold text-slate-700">
        {data.label}
      </div>
      <div className="p-4 space-y-2">
        <input
          type="text"
          placeholder="Column Name"
          value={data.column}
          onChange={(e) => handleChange('column', e.target.value)}
          className="nodrag w-full p-1 border border-slate-400 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
        <select
          value={data.operator}
          onChange={(e) => handleChange('operator', e.target.value)}
          className="nodrag w-full p-1 border border-slate-400 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <option value="==">== (equals)</option>
          <option value="!=">!= (not equals)</option>
          <option value=">">&gt; (greater than)</option>
          <option value="<">&lt; (less than)</option>
          <option value=">=">&gt;=</option>
          <option value="<=">&lt;=</option>
        </select>
        <input
          type="text"
          placeholder="Value"
          value={data.value}
          onChange={(e) => handleChange('value', e.target.value)}
          className="nodrag w-full p-1 border border-slate-400 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
      </div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
export default FilterRowsNode;