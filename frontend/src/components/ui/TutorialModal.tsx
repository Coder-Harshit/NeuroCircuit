import { useEffect } from "react";

type TutorialModalProps = {
  onClose: () => void;
};

// --- Icons ---
const CloseIcon = () => (
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
);
const HelpIcon = () => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);
// ---

function TutorialModal({ onClose }: TutorialModalProps) {
  // Add ESC key listener to close the modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      aria-labelledby="tutorial-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[var(--color-surface-2)] text-[var(--color-text-1)] rounded-lg shadow-xl border border-[var(--color-border-1)] m-4"
        onClick={(e) => e.stopPropagation()} // Prevent click-through
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-1)]">
          <div className="flex items-center gap-2">
            <HelpIcon />
            <h2 id="tutorial-modal-title" className="text-lg font-bold">
              Welcome to NeuroCircuit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            aria-label="Close tutorial"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <p className="text-[var(--color-text-2)]">
            This is a visual, node-based editor for building data processing and
            computer vision pipelines.
          </p>

          <h3 className="text-md font-semibold text-[var(--color-text-1)]">
            Controls
          </h3>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-2)]">
            <li>
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                Right-Click
              </span>{" "}
              on the canvas to open the node menu.
            </li>
            <li>
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                Click & Drag
              </span>{" "}
              on a node to move it.
            </li>
            <li>
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                Click & Drag
              </span>{" "}
              from a node's handle to another to create a connection.
            </li>
            <li>
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                Click
              </span>{" "}
              a node or edge, then press{" "}
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                Delete
              </span>{" "}
              or{" "}
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                Backspace
              </span>{" "}
              to remove it.
            </li>
          </ul>

          <h3 className="text-md font-semibold text-[var(--color-text-1)]">
            Keyboard Shortcuts
          </h3>
          <ul className="list-disc list-inside space-y-2 text-[var(--color-text-2)]">
            <li>
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                A
              </span>
              : Select all nodes.
            </li>{" "}
            <li>
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                Ctrl/Cmd + C
              </span>
              : Copy selected node.
            </li>
            <li>
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                Ctrl/Cmd + V
              </span>
              : Paste node.
            </li>
            <li>
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                Ctrl/Cmd + D
              </span>
              : Duplicate selected node.
            </li>
            <li>
              <span className="font-mono p-1 rounded bg-[var(--color-surface-3)] text-[var(--color-text-1)]">
                F
              </span>
              : Fit view to selection (or all nodes).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TutorialModal;
