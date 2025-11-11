import { Handle, Position } from "@xyflow/react";
import type { ChangeEvent } from "react";
import type { CannyEdgeNodeProps } from "../../nodeTypes";
import LimitedConnectionHandle from "../handle/LimitedConnectionHandle";

// Shared class for form elements
const formElementClasses =
  "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

// --- Icons ---
const EdgeIcon = () => (
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
    <polyline points="17 1 23 7 17 13"></polyline>
    <polyline points="7 23 1 17 7 11"></polyline>
    <line x1="1" y1="17" x2="23" y2="7"></line>
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

function CannyEdgeNode({ id, data }: CannyEdgeNodeProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numValue = parseInt(value, 10);
    data.onChange(id, { [name]: isNaN(numValue) ? 0 : numValue });
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
          <EdgeIcon />
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
        {/* Threshold 1 Input */}
        <div>
          <label
            htmlFor={`threshold1-${id}`}
            className="block text-sm font-medium text-[var(--color-text-2)] mb-1"
          >
            Threshold 1 (Low)
          </label>
          <input
            id={`threshold1-${id}`}
            name="threshold1"
            type="number"
            min="0"
            value={data.threshold1}
            onChange={handleChange}
            aria-label="Low threshold"
            className={formElementClasses}
          />
        </div>

        {/* Threshold 2 Input */}
        <div>
          <label
            htmlFor={`threshold2-${id}`}
            className="block text-sm font-medium text-[var(--color-text-2)] mb-1"
          >
            Threshold 2 (High)
          </label>
          <input
            id={`threshold2-${id}`}
            name="threshold2"
            type="number"
            min="0"
            value={data.threshold2}
            onChange={handleChange}
            aria-label="High threshold"
            className={formElementClasses}
          />
        </div>
      </div>

      {/* Handles */}
      <LimitedConnectionHandle
        type="target"
        position={Position.Left}
        className="!bg-[var(--color-accent)]"
        aria-label="Image input"
        connectionCount={1}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-[var(--color-accent)]"
        aria-label="Edge mask output"
      />
    </div>
  );
}

export default CannyEdgeNode;
