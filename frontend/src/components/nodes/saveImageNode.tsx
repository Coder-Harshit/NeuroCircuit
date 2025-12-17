import { Position } from "@xyflow/react";
import type { SaveImageNodeProps } from "../../nodeTypes";
import { TypedHandle } from "../ui/TypedHandle";

// Simple Download Icon
const DownloadIcon = () => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
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

function SaveImageNode({ data }: SaveImageNodeProps) {
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
          <DownloadIcon />
          <p className="font-bold text-[var(--color-node-header-text)]">
            {data.label || "Download Image"}
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
      <div className="p-4 text-center">
        <p className="text-xs text-[var(--color-text-3)] italic">
          Triggers browser download when pipeline executes.
        </p>
      </div>

      {/* Input Handle Only */}
      <TypedHandle
        type="target"
        position={Position.Left}
        id="img_in"
        dataType="IMAGE"
        aria-label="Image data input"
      />
    </div>
  );
}

export default SaveImageNode;
