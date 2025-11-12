import { Handle, Position } from "@xyflow/react";
import type { ChangeEvent } from "react";
import type { RotateImageNodeProps } from "../../nodeTypes";
import SingleConnectionHandle from "../handle/SingleConnectionHandle";

// Shared class for form elements
const formElementClasses =
  "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

// --- Icons ---
const ColorspaceIcon = () => (
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
    <path d="M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"></path>
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

const rotateOptions = ["Clockwise", "Anticlockwise"];

function RotateImageNode({ id, data }: RotateImageNodeProps) {
  // Handle changes in the select dropdowns
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    data.onChange(id, { [name]: value });
  };
  const handleNumChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Convert value to number, default to 0 if invalid
    const numValue = parseInt(value, 10);
    data.onChange(id, { [name]: isNaN(numValue) ? 0 : numValue });
  };

  // Determine border style based on error state
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
          <ColorspaceIcon />
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
        {/* Angle */}
        <div>
          <label
            htmlFor={`angle-${id}`}
            className="block text-sm font-medium text-[var(--color-text-2)] mb-1"
          >
            Angle (deg)
          </label>
          <input
            id={`angle-${id}`}
            name="angle"
            type="number"
            defaultValue={90}
            value={data.angle ?? 90}
            onChange={handleNumChange}
            aria-label="Angle"
            className={formElementClasses}
          />
        </div>

        {/* Rotation Direction Dropdown */}
        <div>
          <label
            htmlFor={`rotationDirection-${id}`}
            className="block text-sm font-medium text-[var(--color-text-2)] mb-1"
          >
            Rotation Angle
          </label>
          <select
            id={`rotationDirection-${id}`}
            name="rotationDirection"
            value={data.rotationDirection}
            onChange={handleChange}
            aria-label="Rotation Direction"
            className={formElementClasses}
          >
            {rotateOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Handles */}
      <SingleConnectionHandle
        type="target"
        position={Position.Left}
        className="!bg-[var(--color-accent)]"
        aria-label="Image input"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-[var(--color-accent)]"
        aria-label="Converted image output"
      />
    </div>
  );
}

export default RotateImageNode;
