import { Handle, Position } from '@xyflow/react';
import { useMemo } from 'react';
import type { SelectColumnProps } from '../../nodeTypes';

function SelectColumnNode({ id, data }: SelectColumnProps) {
  // `data.columns` is the string of selected columns, e.g., "name,age"
  // We convert it to a Set for easy checking (e.g., selectedColumns.has('name'))
  const selectedColumns = useMemo(() => new Set(data.columns?.split(',').filter(Boolean) || []), [data.columns]);

  const handleCheckboxChange = (columnName: string, isChecked: boolean) => {
    const newSelectedColumns = new Set(selectedColumns);
    if (isChecked) {
      newSelectedColumns.add(columnName);
    } else {
      newSelectedColumns.delete(columnName);
    }
    // Convert the Set back to a comma-separated string and call the onChange handler
    data.onChange?.(id, { columns: Array.from(newSelectedColumns).join(',') });
  };

  return (
    <div className="bg-white border border-slate-400 rounded-md w-[250px] shadow-md">
      {/* Node Header */}
      <div className="bg-blue-200 py-2 px-4 rounded-t-md font-bold text-slate-700">
        {data.label}
      </div>

      {/* Node Body */}
      <div className="p-4">
        <label className="block text-sm font-medium text-slate-600 mb-2">
          Columns to Select
        </label>
        <div className="nodrag max-h-48 overflow-y-auto border border-slate-300 rounded-sm p-2 bg-slate-50">
          {/* If there are no input columns, show a message */}
          {data.inputColumns && data.inputColumns.length > 0 ? (
            data.inputColumns.map((col) => (
              <div key={col} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${id}-${col}`}
                  name={col}
                  checked={selectedColumns.has(col)}
                  onChange={(e) => handleCheckboxChange(col, e.target.checked)}
                  className="mr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
                <label htmlFor={`${id}-${col}`} className="select-none">{col}</label>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm">Connect an input to see columns.</div>
          )}
        </div>
      </div>

      {/* Node Handles */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default SelectColumnNode;