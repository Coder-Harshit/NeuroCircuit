import { useState, useEffect, useMemo, useCallback } from "react";
import type { NodeStatus, PackageManagerProps } from "../../types";

// Simple Chevron Icon for potential future accordion use
// const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

export default function PackageManager({ onClose }: PackageManagerProps) {
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Optional: State to manage accordion visibility if needed later
  // const [openSection, setOpenSection] = useState<'installed' | 'available' | null>('installed');

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const fetchNodeStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/nodes/status`);
      if (!response.ok) throw new Error("Failed to fetch node status");
      const data: NodeStatus[] = await response.json();
      setNodes(data);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Failed to fetch node status:", error);
        setError(err.message || "Could not fetch node statuses");
      } else {
        console.error("Failed to fetch node status:", err);
      }
      // Optionally set an error state here to show in the UI
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, error]);

  useEffect(() => {
    fetchNodeStatus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fetchNodeStatus, onClose]);

  const handleInstall = async (installationNode: NodeStatus) => {
    const nodeType = installationNode.nodeType;
    const deps = installationNode.dependencies || [];

    setInstalling(nodeType);
    setError(null);
    setSuccess(null);
    // setNeedsRestart(false);
    try {
      const response = await fetch(`${API_BASE_URL}/packages/install`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeType, deps }),
      });
      const result = await response.json();
      if (result.status !== "success") {
        throw new Error(result.message || "Failed to install node");
        // alert(`Failed to install ${installationNode}: ${result.message}`);
      }
      setSuccess(result.message);
      // Re-fetch status regardless of success/failure to update the list
      await fetchNodeStatus();
    } catch (err) {
      if (err instanceof Error) {
        console.error(`Failed to install ${nodeType}:`, err);
        setError(err.message || `Network error installing ${nodeType}`);
      } else {
        console.error(`Failed to install ${nodeType}:`, err);
      }
    } finally {
      setInstalling(null);
    }
  };

  const handleUninstall = async (nodeToUninstall: NodeStatus) => {
    const nodeType = nodeToUninstall.nodeType;
    setInstalling(nodeType);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${API_BASE_URL}/packages/uninstall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeType }),
      });
      const result = await response.json();
      if (result.status !== "success") {
        throw new Error(result.message || "Failed to uninstall node");
      }
      setSuccess(result.message);
      // Re-fetch status to show the node as "Available"
      await fetchNodeStatus();
    } catch (err) {
      if (err instanceof Error) {
        console.error(`Failed to uninstall ${nodeType}:`, err);
        setError(err.message || "Network error during uninstall.");
      } else {
        console.error(`Failed to uninstall ${nodeType}:`, err);
      }
    } finally {
      setInstalling(null);
    }
  };

  // Separate nodes into installed and available lists
  const { installedNodes, availableNodes, missingDepsNodes } = useMemo(() => {
    const installed: NodeStatus[] = [];
    const available: NodeStatus[] = [];
    const missing: NodeStatus[] = [];

    nodes.forEach((node) => {
      if (node.status === "Installed") {
        installed.push(node);
      } else if (node.status === "Available") {
        available.push(node);
      } else if (node.status === "Missing Dependencies") {
        missing.push(node);
      }
    });
    // Sort alphabetically within categories
    const sortFn = (a: NodeStatus, b: NodeStatus) =>
      a.label.localeCompare(b.label);
    installed.sort(sortFn);
    available.sort(sortFn);
    missing.sort(sortFn);

    return {
      installedNodes: installed,
      availableNodes: available,
      missingDepsNodes: missing,
    };
  }, [nodes]);

  // const renderNodeList = (
  //   nodeList: NodeStatus[],
  //   isAvailableSection: boolean,
  // ) => (
  //   <ul className="space-y-3">
  //     {nodeList.map((node) => (
  //       <li
  //         key={node.nodeType}
  //         className="p-3 border border-[var(--color-border-2)] rounded-md bg-[var(--color-surface-1)]"
  //       >
  //         <p className="font-bold">{node.label}</p>
  //         <p className="text-sm text-[var(--color-text-2)]">
  //           {node.description}
  //         </p>
  //         {isAvailableSection &&
  //           node.missingDependencies &&
  //           node.missingDependencies.length > 0 && (
  //             <div className="mt-2 pt-2 border-t border-[var(--color-border-1)]">
  //               <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
  //                 <span className="text-sm text-[var(--color-danger-text)] font-semibold">
  //                   Missing:
  //                 </span>
  //                 {node.missingDependencies.map((dep) => (
  //                   <div
  //                     key={dep}
  //                     className="flex items-center gap-2 bg-[var(--color-surface-3)] px-2 py-1 rounded"
  //                   >
  //                     <span className="text-sm font-mono text-[var(--color-text-2)]">
  //                       {dep}
  //                     </span>
  //                     <button
  //                       onClick={() => handleInstall(node)}
  //                       disabled={!!installing}
  //                       className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-accent-text)] text-xs font-bold py-1 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
  //                       aria-label={`Install ${dep}`}
  //                     >
  //                       {installing === dep ? "Installing..." : "Install"}
  //                     </button>
  //                   </div>
  //                 ))}
  //               </div>
  //             </div>
  //           )}
  //       </li>
  //     ))}
  //   </ul>
  // );

  const renderNodeCard = (node: NodeStatus) => {
    const isBusy = installing === node.nodeType;

    return (
      <li
        key={node.nodeType}
        className="p-4 border border-[var(--color-border-2)] rounded-lg bg-[var(--color-surface-1)] shadow-sm space-y-3"
      >
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="font-bold text-lg text-[var(--color-text-1)]">
              {node.label}
            </p>
            <p className="text-sm text-[var(--color-text-3)] font-mono">
              {node.nodeType}
            </p>
          </div>

          {/* Action Button */}
          <div>
            {node.status === "Missing Dependencies" && (
              <button
                onClick={() => handleInstall(node)}
                disabled={isBusy}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {isBusy ? "Installing..." : "Install"}
              </button>
            )}
            {node.status === "Available" && (
              <button
                onClick={() => handleInstall(node)}
                disabled={isBusy}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                {isBusy ? "Installing..." : "Install"}
              </button>
            )}
            {node.status === "Installed" && (
              <button
                onClick={() => handleUninstall(node)}
                disabled={isBusy}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {isBusy ? "Uninstalling..." : "Uninstall"}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-2)]">{node.description}</p>

        {/* All Dependencies */}
        {node.dependencies && node.dependencies.length > 0 && (
          <div className="pt-3 border-t border-[var(--color-border-1)]">
            <p className="text-xs font-semibold text-[var(--color-text-3)] uppercase mb-2">
              Dependencies
            </p>
            <div className="flex flex-wrap gap-2">
              {node.dependencies.map((dep) => (
                <span
                  key={dep}
                  className="text-sm font-mono bg-[var(--color-surface-3)] px-2 py-1 rounded text-[var(--color-text-2)]"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Dependencies */}
        {node.status === "Missing Dependencies" &&
          node.missingDependencies &&
          node.missingDependencies.length > 0 && (
            <div className="pt-3 border-t border-red-500/30">
              <p className="text-sm font-semibold text-[var(--color-danger-text)] mb-2">
                Missing Dependencies:
              </p>
              <div className="flex flex-wrap gap-2">
                {node.missingDependencies.map((dep) => (
                  <span
                    key={dep}
                    className="text-sm font-mono bg-red-500/10 text-[var(--color-danger-text)] px-2 py-1 rounded font-medium"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}
      </li>
    );
  };

  return (
    // Modal backdrop
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-lg shadow-xl bg-[var(--color-surface-2)] border border-[var(--color-border-1)] text-[var(--color-text-1)] flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-border-1)] sticky top-0 bg-[var(--color-surface-2)] z-10">
          <h2 className="text-xl font-bold">Node Manager</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Close package manager"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-6">
          {/* -- Status Messages -- */}
          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-[var(--color-danger-text)]">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400">
              <p className="font-semibold">Success</p>
              <p className="text-sm">{success}</p>
            </div>
          )}

          {isLoading ? (
            <p className="text-center text-[var(--color-text-2)] py-10">
              Loading node statuses...
            </p>
          ) : (
            <>
              {/* -- Section 1: Missing Dependencies -- */}
              {missingDepsNodes.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 text-[var(--color-danger-text)]">
                    Missing Dependencies ({missingDepsNodes.length})
                  </h3>
                  <ul className="space-y-4">
                    {missingDepsNodes.map(renderNodeCard)}
                  </ul>
                </section>
              )}

              {/* -- Section 2: Available to Install -- */}
              {availableNodes.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
                    Available to Install ({availableNodes.length})
                  </h3>
                  <ul className="space-y-4">
                    {availableNodes.map(renderNodeCard)}
                  </ul>
                </section>
              )}

              {/* -- Section 3: Installed -- */}
              <section>
                <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
                  Installed ({installedNodes.length})
                </h3>
                {installedNodes.length > 0 ? (
                  <ul className="space-y-4">
                    {installedNodes.map(renderNodeCard)}
                  </ul>
                ) : (
                  <p className="text-[var(--color-text-3)] italic px-2">
                    No nodes are fully installed.
                  </p>
                )}
              </section>

              {nodes.length === 0 && !isLoading && (
                <p className="text-center text-[var(--color-text-3)] italic py-10">
                  No node manifests found.
                </p>
              )}
              {/*{availableNodes.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 text-[var(--color-danger-text)]">
                    Available Nodes ({availableNodes.length}) -{" "}
                    <span className="font-normal">Dependencies Missing</span>
                  </h3>
                  {renderNodeList(availableNodes, true)}
                </section>
              )}

              <section>
                <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
                  Installed Nodes ({installedNodes.length})
                </h3>
                {installedNodes.length > 0 ? (
                  renderNodeList(installedNodes, false)
                ) : (
                  <p className="text-[var(--color-text-3)] italic">
                    No nodes are fully installed.
                  </p>
                )}
              </section>*/}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
