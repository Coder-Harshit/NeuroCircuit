import { Handle, Position } from "@xyflow/react";
import { useMemo } from "react";
import type { SelectColumnProps } from "../../nodeTypes";
import SingleConnectionHandle from "../handle/SingleConnectionHandle";

// Simple Columns Icon
const ColumnsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="12" y1="3" x2="12" y2="21"></line>
  </svg>
);
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

function SelectColumnNode({ id, data }: SelectColumnProps) {
  const selectedColumns = useMemo(
    () => new Set(data.columns?.split(",").filter(Boolean) || []),
    [data.columns],
  );

  const handleCheckboxChange = (columnName: string, isChecked: boolean) => {
    const newSelectedColumns = new Set(selectedColumns);
    if (isChecked) {
      newSelectedColumns.add(columnName);
    } else {
      newSelectedColumns.delete(columnName);
    }
    data.onChange?.(id, { columns: Array.from(newSelectedColumns).join(",") });
  };

  const isError = data.isError;
  const borderClass = isError
    ? "border-[var(--color-danger-border)] shadow-lg shadow-red-500/20"
    : "border-[var(--color-border-1)]";

  return (
    <div
      className={`
        w-[300px] rounded-lg shadow-md bg-[var(--color-surface-2)] text-[var(--color-text-1)]
        border ${borderClass}
    `}
    >
      {/* Header */}
      <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ColumnsIcon />
          <p className="font-bold text-[var(--color-node-header-text)]">
            {data.label}
          </p>
        </div>
        {data.description && (
          <div
            title={data.description}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-2)] cursor-help"
          >
            <InfoIcon />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-2">
        <label className="block text-sm font-medium text-[var(--color-text-2)]">
          Columns to Select
        </label>
        <div className="nodrag max-h-48 overflow-y-auto border rounded-md p-2 bg-[var(--color-surface-3)] border-[var(--color-border-2)]">
          {data.inputColumns && data.inputColumns.length > 0 ? (
            data.inputColumns.map((col) => (
              <div
                key={col}
                className="flex items-center p-1 rounded hover:bg-[var(--color-border-1)]"
              >
                <input
                  type="checkbox"
                  id={`${id}-${col}`}
                  name={col}
                  checked={selectedColumns.has(col)}
                  onChange={(e) => handleCheckboxChange(col, e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                />
                <label
                  htmlFor={`${id}-${col}`}
                  className="select-none flex-grow"
                >
                  {col}
                </label>
              </div>
            ))
          ) : (
            <div className="text-[var(--color-text-3)] text-sm p-4 text-center">
              Connect an input to see columns.
            </div>
          )}
        </div>
      </div>

      <SingleConnectionHandle
        type="target"
        position={Position.Left}
        className="!bg-[var(--color-accent)]"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-[var(--color-accent)]"
      />
    </div>
  );
}

export default SelectColumnNode;
