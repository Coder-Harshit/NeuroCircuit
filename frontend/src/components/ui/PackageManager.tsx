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
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

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
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-lg shadow-xl bg-[var(--color-surface-2)] border border-[var(--color-border-1)] text-[var(--color-text-1)] flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-border-1)]">
          <h2 className="text-xl font-bold">Node Package Manager</h2>
          <button onClick={onClose} className="p-1 rounded-full text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]" aria-label="Close package manager">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          {isLoading ? <p className="text-center text-[var(--color-text-2)]">Loading node statuses...</p> : (
            <ul className="space-y-3">
              {nodes.map(node => (
                <li key={node.nodeType} className="p-3 border border-[var(--color-border-2)] rounded-md bg-[var(--color-surface-1)]">
                  <p className="font-bold">{node.label}</p>
                  <p className="text-sm text-[var(--color-text-2)]">{node.description}</p>
                  {node.status === 'Missing Dependencies' && (
                    <div className="mt-2 pt-2 border-t border-[var(--color-border-1)]">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-[var(--color-danger-text)]">
                          Missing: <span className="font-semibold">{(node.missingDependencies || []).join(', ')}</span>
                        </span>
                        {(node.missingDependencies || []).map(dep => (
                          <button
                            key={dep}
                            onClick={() => handleInstall(dep)}
                            disabled={!!installing}
                            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-text)] text-xs font-bold py-1 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                            aria-label={`Install ${dep}`}
                          >
                            {installing === dep ? 'Installing...' : `Install ${dep}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}