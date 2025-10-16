import { Handle, Position } from '@xyflow/react';
import { type FilterRowsNodeProps } from '../../nodeTypes';

const formElementClasses = "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

function FilterRowsNode({id, data}: FilterRowsNodeProps) {
  const handleChange = (field: string, value: string) => {
    data.onChange?.(id, { [field]: value });
  };

  return (
    <div className="w-[300px] rounded-lg shadow-md bg-[var(--color-surface-2)] border border-[var(--color-border-1)] text-[var(--color-text-1)]">
      <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg">
        <p className="font-bold text-[var(--color-node-header-text)]">{data.label}</p>
      </div>
      <div className="p-4 space-y-3">
        <input
          type="text"
          placeholder="Column Name"
          value={data.column}
          onChange={(e) => handleChange('column', e.target.value)}
          className={formElementClasses}
        />
        <select
          value={data.operator}
          onChange={(e) => handleChange('operator', e.target.value)}
          className={formElementClasses}
        >
          <option value="==">== (equals)</option>
          <option value="!=">!= (not equals)</option>
          <option value=">">&gt; (greater than)</option>
          <option value="<">&lt; (less than)</option>
          <option value=">=">&gt;= (greater than or equal)</option>
          <option value="<=">&lt;= (less than or equal)</option>
        </select>
        <input
          type="text"
          placeholder="Value"
          value={data.value}
          onChange={(e) => handleChange('value', e.target.value)}
          className={formElementClasses}
        />
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[var(--color-accent)]" />
      <Handle type="target" position={Position.Left} className="!bg-[var(--color-accent)]" />
    </div>
  );
}
export default FilterRowsNode;