import { Handle, Position } from '@xyflow/react';
import type { ChangeEvent } from 'react';
// Import the type we'll create next
import type { SaveImageNodeProps } from '../../nodeTypes';

// Shared class for form elements
const formElementClasses = "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

function SaveImageNode({ id, data }: SaveImageNodeProps) {

    // Handle changes in the file path input
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        data.onChange(id, { filePath: event.target.value });
    };

    // Determine border style based on error state
    const isError = data.isError;
    const borderClass = isError
        ? 'border-[var(--color-danger-border)] shadow-lg shadow-red-500/20'
        : 'border-[var(--color-border-1)]';

    return (
        <div className={`
            w-[300px] rounded-lg shadow-md bg-[var(--color-surface-2)] text-[var(--color-text-1)]
            border ${borderClass}
        `}>
            {/* Header */}
            <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg">
                <p className="font-bold text-[var(--color-node-header-text)]">{data.label}</p>
            </div>

            {/* Body */}
            <div className="p-4 space-y-2">
                <label htmlFor={`filePath-${id}`} className="block text-sm font-medium text-[var(--color-text-2)]">
                    Save Path / Filename
                </label>
                <input
                    id={`filePath-${id}`}
                    name="filePath"
                    type="text"
                    value={data.filePath ?? ''}
                    onChange={handleChange}
                    placeholder="e.g., output/processed_image.png"
                    aria-label="Save file path"
                    className={formElementClasses}
                />
                <p className="text-xs text-[var(--color-text-3)]">
                    Path is relative to the backend server.
                </p>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-[var(--color-accent)]"
            />
            {/* Optional: Add a source handle if the node should pass data through */}
            {/* <Handle type="source" position={Position.Right} className="!bg-[var(--color-accent)]" /> */}
        </div>
    );
}

export default SaveImageNode;