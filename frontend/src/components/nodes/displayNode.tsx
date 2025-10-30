import { Handle, Position } from '@xyflow/react';
import type { DisplayNodeProps } from '../../nodeTypes';

function DisplayNode({ data }: DisplayNodeProps) {
  let tableData: Record<string, unknown>[] = [];
  if (data.result) {
    try {
      tableData = JSON.parse(data.result) as Record<string, unknown>[];
    } catch {
      tableData = [];
    }
  }

  return (
    <div className="w-[400px] max-h-[350px] flex flex-col rounded-lg shadow-md bg-[var(--color-surface-2)] border border-[var(--color-border-1)] text-[var(--color-text-1)]">
      <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg">
        <p className="font-bold text-[var(--color-node-header-text)]">Display</p>
      </div>
      <div className="p-2 flex-grow overflow-auto">
        {tableData.length > 0 ? (
          <table className="table-auto w-full text-xs text-left">
            <thead className="sticky top-0 bg-[var(--color-surface-3)]">
              <tr>
                {Object.keys(tableData[0]).map(key => (
                  <th scope="col" className="p-2 font-semibold" key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-1)]">
              {tableData.map((row: Record<string, unknown>, index: number) => (
                <tr key={index}>
                  {Object.values(row).map((val: unknown, i: number) => (
                    <td className="p-2" key={i}>{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-[var(--color-text-3)] text-center p-8">Connect a node to display its output.</div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-[var(--color-accent)]" />
    </div>
  );
}

export default DisplayNode;