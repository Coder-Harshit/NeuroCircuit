import { Position } from "@xyflow/react";
import type { ChangeEvent } from "react";
import type { BlurImageNodeProps } from "../../nodeTypes";
import LimitedConnectionHandle from "../handle/LimitedConnectionHandle";

// Shared class for form elements
const formElementClasses =
  "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

// --- Icons ---
const BlurIcon = () => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="12" r="5"></circle>
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

function BlurImageNode({ id, data }: BlurImageNodeProps) {
  const handleChange = (
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    if (name === "kernelSize") {
      const numValue = parseInt(value, 10);
      data.onChange(id, { [name]: isNaN(numValue) ? 1 : numValue });
    } else {
      data.onChange(id, { [name]: value });
    }
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
          <BlurIcon />
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
        {/* Blur Type Dropdown */}
        <div>
          <label
            htmlFor={`blurType-${id}`}
            className="block text-sm font-medium text-[var(--color-text-2)] mb-1"
          >
            Blur Type
          </label>
          <select
            id={`blurType-${id}`}
            name="blurType"
            value={data.blurType}
            onChange={handleChange}
            aria-label="Blur type"
            className={formElementClasses}
          >
            <option value="GAUSSIAN">Gaussian</option>
            <option value="MEDIAN">Median</option>
            <option value="BILATERAL">Bilateral</option>
          </select>
        </div>

        {/* Kernel Size Input */}
        <div>
          <label
            htmlFor={`kernelSize-${id}`}
            className="block text-sm font-medium text-[var(--color-text-2)] mb-1"
          >
            Kernel Size (odd, &gt;= 1)
          </label>
          <input
            id={`kernelSize-${id}`}
            name="kernelSize"
            type="number"
            min="1"
            step="2"
            value={data.kernelSize}
            onChange={handleChange}
            aria-label="Kernel size"
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
      />
      <LimitedConnectionHandle
        type="source"
        position={Position.Right}
        className="!bg-[var(--color-accent)]"
        aria-label="Blurred image output"
      />
    </div>
  );
}

export default BlurImageNode;
