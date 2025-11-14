import { Handle, Position } from "@xyflow/react";
import type { ChangeEvent } from "react";
import type { HandleMissingNodeProps } from "../../nodeTypes";
import LimitedConnectionHandle from "../handle/LimitedConnectionHandle";

// Shared class for form elements
const formElementClasses =
  "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

// --- Icons ---
const CleanIcon = () => (
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
    <path d="M9.5 2.1l.6 6.3 6.3.6L18 2.1l-8.5 0Z" />
    <path d="M14.2 14.2 18 18" />
    <path d="M2.1 9.5l6.3.6.6 6.3L2.1 18l0-8.5Z" />
    <path d="M14.2 9.8 18 6" />
    <path d="M9.8 14.2 6 18" />
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

function HandleMissingNode({ id, data }: HandleMissingNodeProps) {
  const handleChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    data.onChange?.(id, { strategy: evt.target.value });
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
          <CleanIcon />
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
            htmlFor="strategy"
            className="block text-sm font-medium text-[var(--color-text-2)] mb-1"
          >
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
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-[var(--color-accent)]"
      />
      <LimitedConnectionHandle
        type="target"
        position={Position.Left}
        className="!bg-[var(--color-accent)]"
      />
    </div>
  );
}
export default HandleMissingNode;
