import { Handle, Position } from '@xyflow/react';
// Import the type we'll create next
import type { DisplayImageNodeProps } from '../../nodeTypes';

// Simple Image Icon (example)
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;


function DisplayImageNode({ id, data }: DisplayImageNodeProps) {
    // Determine border style based on error state
    const isError = data.isError;
    const borderClass = isError
        ? 'border-[var(--color-danger-border)] shadow-lg shadow-red-500/20'
        : 'border-[var(--color-border-1)]';

    return (
        <div className={`
            max-w-xs rounded-lg shadow-md bg-[var(--color-surface-2)] text-[var(--color-text-1)]
            border ${borderClass} flex flex-col
        `}>
            {/* Header */}
            <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg flex items-center gap-2">
                <ImageIcon />
                <p className="font-bold text-[var(--color-node-header-text)]">{data.label || 'Display Image'}</p>
            </div>

            {/* Body */}
            <div className="p-2 flex-grow flex items-center justify-center min-h-[100px]">
                {data.imageBase64 ? (
                    <img
                        src={data.imageBase64}
                        alt={`Output for node ${id}`}
                        className="max-w-full max-h-64 object-contain rounded"
                    />
                ) : (
                    <p className="text-xs text-center text-[var(--color-text-3)] italic p-4">
                        Connect input and run pipeline to display image.
                    </p>
                )}
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

export default DisplayImageNode;