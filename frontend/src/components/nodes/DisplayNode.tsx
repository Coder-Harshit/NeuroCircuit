import { Handle, Position } from '@xyflow/react';
import type { DisplayNodeProps } from '../../nodeTypes';

function DisplayNode({ data }: DisplayNodeProps) {
  // Parse the JSON string result if it exists and guard against invalid JSON
  let tableData: Record<string, unknown>[] = [];
  if (data.result) {
    try {
      tableData = JSON.parse(data.result) as Record<string, unknown>[];
    } catch {
      tableData = [];
    }
  }

  return (
    <div className="bg-white border border-gray-400 rounded-lg shadow-md w-[400px] max-h-[300px] flex flex-col">
      <div className="bg-gray-200 py-1 px-3 rounded-t-lg font-bold text-gray-700">
        Display
      </div>
      <div className="p-2 flex-grow overflow-auto">
        {tableData.length > 0 ? (
          <table className="table-auto w-full text-xs">
            <thead>
              <tr className="bg-slate-100">
                {Object.keys(tableData[0]).map(key => <th scope="col" className="p-1 text-left" key={key}>{key}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row: Record<string, unknown>, index: number) => (
                <tr key={index} className="border-b">
                  {Object.values(row).map((val: unknown, i: number) => <td className="p-1" key={i}>{String(val)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center p-4">Connect a node to display its output.</p>
        )}
      </div>
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export default DisplayNode;