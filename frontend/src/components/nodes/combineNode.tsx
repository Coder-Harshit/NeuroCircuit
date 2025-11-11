import { Position } from "@xyflow/react";
import type { CombineNodeProps } from "../../nodeTypes";
import LimitedConnectionHandle from "../handle/LimitedConnectionHandle";

// Shared class for form elements
const formElementClasses =
  "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

// --- Icons ---
const CombineIcon = () => (
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
    <path d="M18 18v-6a4 4 0 0 0-4-4H6" />
    <path d="M6 6v6a4 4 0 0 0 4 4h8" />
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="18" r="3" />
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
// ---

function CombineNode({ id, data }: CombineNodeProps) {
  const handleAxisChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newAxis = parseInt(event.target.value, 10);
    data.onChange(id, { ...data, axis: newAxis as 0 | 1 });
  };

  const isError = data.isError;
  const borderClass = isError
    ? "border-[var(--color-danger-border)] shadow-lg shadow-red-500/20"
    : "border-[var(--color-border-1)]";

  return (
    <div
      className={`
        w-[250px] rounded-lg shadow-md bg-[var(--color-surface-2)] text-[var(--color-text-1)]
        border ${borderClass}
    `}
    >
      {/* Header */}
      <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CombineIcon />
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
      <div className="p-4 space-y-3">
        <div>
          <label
            htmlFor="axis"
            className="block text-sm font-medium text-[var(--color-text-2)] mb-1"
          >
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
      </div>

      {/* Handles */}
      <LimitedConnectionHandle
        type="source"
        position={Position.Right}
        className="!bg-[var(--color-accent)]"
      />
      <LimitedConnectionHandle
        id="a"
        type="target"
        position={Position.Left}
        style={{ top: "33%" }}
        className="!bg-[var(--color-accent)]"
      />
      <LimitedConnectionHandle
        id="b"
        type="target"
        position={Position.Left}
        style={{ top: "66%" }}
        className="!bg-[var(--color-accent)]"
      />
    </div>
  );
}

export default CombineNode;
