import { useState, useEffect } from 'react';
import type { NodeStatus, PackageManagerProps } from '../../types';

export default function PackageManager({ onClose }: PackageManagerProps) {
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);

  const fetchNodeStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/nodes/status');
      const data = await response.json();
      setNodes(data);
    } catch (error) {
      console.error("Failed to fetch node status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNodeStatus();
  }, []);

  const handleInstall = async (packageName: string) => {
    setInstalling(packageName);
    try {
      await fetch('http://127.0.0.1:8000/packages/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName }),
      });
      fetchNodeStatus();
    } catch (error) {
      console.error(`Failed to install ${packageName}:`, error);
    } finally {
      setInstalling(null);
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-1/2 p-6 text-slate-900 dark:text-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Node Package Manager</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        {isLoading ? <p>Loading...</p> : (
          <ul className="space-y-2">
            {nodes.map(node => (
              <li key={node.nodeType} className="p-2 border dark:border-slate-700 rounded-md">
                <div className="font-bold">{node.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{node.description}</div>
                {node.status === 'Missing Dependencies' && (
                  <div className="mt-2">
                    <span className="text-red-500 text-sm">Missing: {(node.missingDependencies || []).join(', ')}</span>
                    {(node.missingDependencies || []).map(dep => (
                      <button
                        key={dep}
                        onClick={() => handleInstall(dep)}
                        disabled={!!installing}
                        className="ml-2 bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded disabled:bg-gray-400"
                      >
                        {installing === dep ? 'Installing...' : `Install ${dep}`}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}