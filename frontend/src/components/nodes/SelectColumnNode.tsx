import { Handle, Position } from '@xyflow/react';
import { useMemo } from 'react';
import type { SelectColumnProps } from '../../nodeTypes';

function SelectColumnNode({ id, data }: SelectColumnProps) {
  const selectedColumns = useMemo(() => new Set(data.columns?.split(',').filter(Boolean) || []), [data.columns]);

  const handleCheckboxChange = (columnName: string, isChecked: boolean) => {
    const newSelectedColumns = new Set(selectedColumns);
    if (isChecked) {
      newSelectedColumns.add(columnName);
    } else {
      newSelectedColumns.delete(columnName);
    }
    data.onChange?.(id, { columns: Array.from(newSelectedColumns).join(',') });
  };

  return (
    <div className="w-[300px] rounded-lg shadow-md bg-[var(--color-surface-2)] border border-[var(--color-border-1)] text-[var(--color-text-1)]">
      <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg">
        <p className="font-bold text-[var(--color-node-header-text)]">{data.label}</p>
      </div>

      <div className="p-4 space-y-2">
        <label className="block text-sm font-medium text-[var(--color-text-2)]">
          Columns to Select
        </label>
        <div className="nodrag max-h-48 overflow-y-auto border rounded-md p-2 bg-[var(--color-surface-3)] border-[var(--color-border-2)]">
          {data.inputColumns && data.inputColumns.length > 0 ? (
            data.inputColumns.map((col) => (
              <div key={col} className="flex items-center p-1 rounded hover:bg-[var(--color-border-1)]">
                <input
                  type="checkbox"
                  id={`${id}-${col}`}
                  name={col}
                  checked={selectedColumns.has(col)}
                  onChange={(e) => handleCheckboxChange(col, e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <label htmlFor={`${id}-${col}`} className="select-none flex-grow">{col}</label>
              </div>
            ))
          ) : (
            <div className="text-[var(--color-text-3)] text-sm p-4 text-center">Connect an input to see columns.</div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-[var(--color-accent)]" />
      <Handle type="source" position={Position.Right} className="!bg-[var(--color-accent)]" />
    </div>
  );
}

export default SelectColumnNode;