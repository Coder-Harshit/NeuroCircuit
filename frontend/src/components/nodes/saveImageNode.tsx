import { Handle, Position } from '@xyflow/react';
// Import the type we'll update next
import type { SaveImageNodeProps } from '../../nodeTypes';

// Simple Download Icon
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;


function SaveImageNode({ data }: SaveImageNodeProps) {
    // Determine border style based on error state
    const isError = data.isError;
    const borderClass = isError
        ? 'border-[var(--color-danger-border)] shadow-lg shadow-red-500/20'
        : 'border-[var(--color-border-1)]';

    return (
        <div className={`
            w-[200px] rounded-lg shadow-md bg-[var(--color-surface-2)] text-[var(--color-text-1)]
            border ${borderClass}
        `}>
            {/* Header */}
            <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg flex items-center justify-center gap-2">
                 <DownloadIcon />
                <p className="font-bold text-[var(--color-node-header-text)]">{data.label || 'Download Image'}</p>
            </div>

            {/* Body (Optional: Add a small message) */}
            <div className="p-4 text-center">
                 <p className="text-xs text-[var(--color-text-3)] italic">
                    Triggers browser download when pipeline executes.
                 </p>
            </div>

            {/* Input Handle Only */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-[var(--color-accent)]"
                aria-label="Image data input"
            />
        </div>
    );
}

export default SaveImageNode;