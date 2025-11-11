import { Position } from "@xyflow/react";
import type { DisplayNodeProps } from "../../nodeTypes";
import SingleConnectionHandle from "../handle/SingleConnectionHandle";

// --- Icons ---
const TableIcon = () => (
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
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
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
// ---

function DisplayNode({ data }: DisplayNodeProps) {
  let tableData: Record<string, unknown>[] = [];
  if (data.result) {
    try {
      tableData = JSON.parse(data.result) as Record<string, unknown>[];
    } catch {
      tableData = [];
    }
  }

  const isError = data.isError;
  const borderClass = isError
    ? "border-[var(--color-danger-border)] shadow-lg shadow-red-500/20"
    : "border-[var(--color-border-1)]";

  return (
    <div
      className={`
        w-[400px] max-h-[350px] flex flex-col rounded-lg shadow-md bg-[var(--color-surface-2)]
        border text-[var(--color-text-1)] ${borderClass}
    `}
    >
      {/* Header */}
      <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TableIcon />
          <p className="font-bold text-[var(--color-node-header-text)]">
            {data.label || "Display"}
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
      <div className="p-2 flex-grow overflow-auto">
        {tableData.length > 0 ? (
          <table className="table-auto w-full text-xs text-left">
            <thead className="sticky top-0 bg-[var(--color-surface-3)]">
              <tr>
                {Object.keys(tableData[0]).map((key) => (
                  <th scope="col" className="p-2 font-semibold" key={key}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-1)]">
              {tableData.map((row: Record<string, unknown>, index: number) => (
                <tr key={index}>
                  {Object.values(row).map((val: unknown, i: number) => (
                    <td className="p-2" key={i}>
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-[var(--color-text-3)] text-center p-8">
            Connect a node to display its output.
          </div>
        )}
      </div>
      <SingleConnectionHandle
        type="target"
        position={Position.Left}
        className="!bg-[var(--color-accent)]"
      />
    </div>
  );
}

export default DisplayNode;
