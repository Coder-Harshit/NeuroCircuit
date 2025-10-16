import { Handle, Position } from '@xyflow/react';
import type { CombineNodeProps } from '../../nodeTypes';

const formElementClasses = "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

function CombineNode({ id, data }: CombineNodeProps) {
  const handleAxisChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newAxis = parseInt(event.target.value, 10);
    data.onChange(id, { ...data, axis: newAxis });
  };

  return (
    <div className="w-[250px] rounded-lg shadow-md bg-[var(--color-surface-2)] border border-[var(--color-border-1)] text-[var(--color-text-1)]">
      <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg">
        <p className="font-bold text-[var(--color-node-header-text)]">{data.label}</p>
      </div>
      <div className="p-4 space-y-2">
        <label htmlFor="axis" className="block text-sm font-medium text-[var(--color-text-2)]">
          Concatenate along:
        </label>
        <select
          id="axis"
          value={data.axis}
          onChange={handleAxisChange}
          aria-label="Concatenate axis"
          className={formElementClasses}
        >
          <option value={0}>Rows (Vertical)</option>
          <option value={1}>Columns (Horizontal)</option>
        </select>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[var(--color-accent)]" />
      <Handle id="a" type="target" position={Position.Left} style={{ top: '33%' }} className="!bg-[var(--color-accent)]" />
      <Handle id="b" type="target" position={Position.Left} style={{ top: '66%' }} className="!bg-[var(--color-accent)]" />
    </div>
  );
}

export default CombineNode;