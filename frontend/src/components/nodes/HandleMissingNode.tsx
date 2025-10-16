import { Handle, Position } from '@xyflow/react';
import type { ChangeEvent } from 'react';
import type { HandleMissingNodeProps } from '../../nodeTypes';

const formElementClasses = "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

function HandleMissingNode({id, data}: HandleMissingNodeProps) {
  const handleChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    data.onChange?.(id, { strategy: evt.target.value });
  };

  return (
    <div className="w-[250px] rounded-lg shadow-md bg-[var(--color-surface-2)] border border-[var(--color-border-1)] text-[var(--color-text-1)]">
      <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg">
        <p className="font-bold text-[var(--color-node-header-text)]">{data.label}</p>
      </div>
      <div className="p-4 space-y-2">
        <label htmlFor="strategy" className="block text-sm font-medium text-[var(--color-text-2)]">
          Strategy
        </label>
        <select
          id="strategy"
          name="strategy"
          value={data.strategy}
          onChange={handleChange}
          aria-label="Missing data strategy"
          className={formElementClasses}
        >
          <option value="mean">Mean</option>
          <option value="median">Median</option>
          <option value="most_frequent">Most Frequent</option>
          <option value="constant">Constant (fill with 0)</option>
        </select>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[var(--color-accent)]" />
      <Handle type="target" position={Position.Left} className="!bg-[var(--color-accent)]" />
    </div>
  );
}
export default HandleMissingNode;