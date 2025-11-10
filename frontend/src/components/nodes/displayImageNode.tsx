import { Position } from "@xyflow/react";
import type { DisplayImageNodeProps } from "../../nodeTypes";
import SingleConnectionHandle from "../handle/SingleConnectionHandle";

// --- Icons ---
const ImageIcon = () => (
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
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
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

function DisplayImageNode({ id, data }: DisplayImageNodeProps) {
  // Determine border style based on error state
  const isError = data.isError;
  const borderClass = isError
    ? "border-[var(--color-danger-border)] shadow-lg shadow-red-500/20"
    : "border-[var(--color-border-1)]";

  return (
    <div
      className={`
            max-w-xs rounded-lg shadow-md bg-[var(--color-surface-2)] text-[var(--color-text-1)]
            border ${borderClass} flex flex-col
        `}
    >
      {/* Header */}
      <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon />
          <p className="font-bold text-[var(--color-node-header-text)]">
            {data.label || "Display Image"}
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
      <div className="p-2 flex-grow flex items-center justify-center min-h-[100px]">
        {data.imageBase64 ? (
          <img
            src={data.imageBase64}
            alt={`Output for node ${id}`}
            className="max-w-full max-h-64 object-contain rounded"
          />
        ) : (
          <p className="text-xs text-center text-[var(--color-text-3)] italic p-4">
            Connect input and run pipeline to display image.
          </p>
        )}
      </div>

      {/* Input Handle Only */}
      <SingleConnectionHandle
        type="target"
        position={Position.Left}
        className="!bg-[var(--color-accent)]"
        aria-label="Image data input"
      />
    </div>
  );
}

export default DisplayImageNode;
