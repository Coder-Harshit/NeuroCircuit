import { Handle, Position } from "@xyflow/react";
import type { ChangeEvent } from "react";
import type { RotateImageNodeProps } from "../../nodeTypes";
import LimitedConnectionHandle from "../handle/LimitedConnectionHandle";

// Shared class for form elements
const formElementClasses =
  "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

// --- Icons ---
const RotateIcon = () => (
  // License: CC Attribution. Made by tetrisly: https://tetrisly.gumroad.com/l/freeicons
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path fill-rule="evenodd" d="M4.98313549,11.0001422 C5.49589839,10.9914935 5.92501998,11.3703506 5.99116425,11.8666444 L5.99985778,11.9831355 L6.00348884,12.2068855 C6.11245031,15.4321748 8.76323537,17.9999971 11.9999971,17.9999971 C12.1869612,17.9999971 12.3726725,17.9914753 12.5567465,17.9745765 L12.2928932,17.7071068 C11.9023689,17.3165825 11.9023689,16.6834175 12.2928932,16.2928932 C12.6834175,15.9023689 13.3165825,15.9023689 13.7071068,16.2928932 L15.7071068,18.2928932 C16.0976311,18.6834175 16.0976311,19.3165825 15.7071068,19.7071068 L13.7071068,21.7071068 C13.3165825,22.0976311 12.6834175,22.0976311 12.2928932,21.7071068 C11.9023689,21.3165825 11.9023689,20.6834175 12.2928932,20.2928932 L12.6111505,19.9769552 C12.4086045,19.9922816 12.2047796,19.9999971 11.9999971,19.9999971 C7.7687005,19.9999971 4.28886152,16.7094374 4.01666425,12.5105203 L4.00420123,12.2575143 L4.00014222,12.0168645 C3.9908282,11.4646583 4.43092928,11.0094562 4.98313549,11.0001422 Z M11.7071068,2.29289322 C12.0675907,2.65337718 12.0953203,3.22060824 11.7902954,3.61289944 L11.7071068,3.70710678 L11.3891629,4.0230186 C11.5916051,4.00770767 11.7953244,4 12,4 C16.418278,4 20,7.581722 20,12 C20,12.5522847 19.5522847,13 19,13 C18.4477153,13 18,12.5522847 18,12 C18,8.6862915 15.3137085,6 12,6 C11.8129339,6 11.6271216,6.00853145 11.4429483,6.02544919 L11.7071068,6.29289322 C12.0976311,6.68341751 12.0976311,7.31658249 11.7071068,7.70710678 C11.3466228,8.06759074 10.7793918,8.09532028 10.3871006,7.79029539 L10.2928932,7.70710678 L8.29289322,5.70710678 C7.93240926,5.34662282 7.90467972,4.77939176 8.20970461,4.38710056 L8.29289322,4.29289322 L10.2928932,2.29289322 C10.6834175,1.90236893 11.3165825,1.90236893 11.7071068,2.29289322 Z" />
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
          <RotateIcon />
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
      <LimitedConnectionHandle
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
