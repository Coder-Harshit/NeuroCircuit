import { useState, useEffect, useMemo } from 'react';
import type { NodeStatus, PackageManagerProps } from '../../types';

// Simple Chevron Icon for potential future accordion use
// const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

export default function PackageManager({ onClose }: PackageManagerProps) {
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  // Optional: State to manage accordion visibility if needed later
  // const [openSection, setOpenSection] = useState<'installed' | 'available' | null>('installed');

  const fetchNodeStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/nodes/status');
      if (!response.ok) throw new Error('Failed to fetch node status');
      const data = await response.json();
      setNodes(data);
    } catch (error) {
      console.error("Failed to fetch node status:", error);
      // Optionally set an error state here to show in the UI
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
      const response = await fetch('http://127.0.0.1:8000/packages/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageName }),
      });
      const result = await response.json();
      if (result.status !== 'success') {
         // Basic error display, could be improved with a state variable
        alert(`Failed to install ${packageName}: ${result.message}`);
      }
      // Re-fetch status regardless of success/failure to update the list
      await fetchNodeStatus();
    } catch (error) {
      console.error(`Failed to install ${packageName}:`, error);
      alert(`Network error installing ${packageName}. See console for details.`);
    } finally {
      setInstalling(null);
    }
  };

  // Separate nodes into installed and available lists
  const { installedNodes, availableNodes } = useMemo(() => {
    const installed: NodeStatus[] = [];
    const available: NodeStatus[] = [];
    nodes.forEach(node => {
      if (node.status === 'Installed') {
        installed.push(node);
      } else if (node.status === 'Missing Dependencies') {
        available.push(node);
      }
    });
    // Sort alphabetically within categories
    installed.sort((a, b) => a.label.localeCompare(b.label));
    available.sort((a, b) => a.label.localeCompare(b.label));
    return { installedNodes: installed, availableNodes: available };
  }, [nodes]);

  const renderNodeList = (nodeList: NodeStatus[], isAvailableSection: boolean) => (
    <ul className="space-y-3">
      {nodeList.map(node => (
        <li key={node.nodeType} className="p-3 border border-[var(--color-border-2)] rounded-md bg-[var(--color-surface-1)]">
          <p className="font-bold">{node.label}</p>
          <p className="text-sm text-[var(--color-text-2)]">{node.description}</p>
          {isAvailableSection && node.missingDependencies && node.missingDependencies.length > 0 && (
            <div className="mt-2 pt-2 border-t border-[var(--color-border-1)]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-sm text-[var(--color-danger-text)] font-semibold">
                  Missing:
                </span>
                {node.missingDependencies.map(dep => (
                  <div key={dep} className="flex items-center gap-2 bg-[var(--color-surface-3)] px-2 py-1 rounded">
                     <span className="text-sm font-mono text-[var(--color-text-2)]">{dep}</span>
                     <button
                        onClick={() => handleInstall(dep)}
                        disabled={!!installing}
                        className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-text)] text-xs font-bold py-1 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        aria-label={`Install ${dep}`}
                      >
                        {installing === dep ? 'Installing...' : 'Install'}
                      </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    // Modal backdrop
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20" onClick={onClose}>
      {/* Modal content */}
      <div
        className="w-full max-w-3xl rounded-lg shadow-xl bg-[var(--color-surface-2)] border border-[var(--color-border-1)] text-[var(--color-text-1)] flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-border-1)] sticky top-0 bg-[var(--color-surface-2)] z-10">
          <h2 className="text-xl font-bold">Node Package Manager</h2>
          <button onClick={onClose} className="p-1 rounded-full text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]" aria-label="Close package manager">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-6">
          {isLoading ? (
            <p className="text-center text-[var(--color-text-2)] py-10">Loading node statuses...</p>
          ) : (
            <>
              {/* Available Nodes Section */}
              {availableNodes.length > 0 && (
                <section>
                   <h3 className="text-lg font-semibold mb-3 text-[var(--color-danger-text)]">
                    Available Nodes ({availableNodes.length}) - <span className="font-normal">Dependencies Missing</span>
                  </h3>
                  {renderNodeList(availableNodes, true)}
                </section>
              )}

              {/* Installed Nodes Section */}
              <section>
                <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
                  Installed Nodes ({installedNodes.length})
                </h3>
                 {installedNodes.length > 0 ? (
                    renderNodeList(installedNodes, false)
                 ) : (
                    <p className="text-[var(--color-text-3)] italic">No nodes are fully installed.</p>
                 )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}