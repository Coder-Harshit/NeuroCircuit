import { Handle, Position } from '@xyflow/react';
import type { ChangeEvent } from 'react';
// Import the type we'll create next
import type { ResizeImageNodeProps } from '../../nodeTypes';

// Shared class for form elements
const formElementClasses = "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

// Simple Resize Icon (example)
const ResizeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="m16 16 3-3-3-3"/><path d="M19 13H9"/><path d="M12 21v-3"/><path d="M9 18H6"/><path d="M12 3v3"/><path d="M9 6H6"/></svg>;

function ResizeImageNode({ id, data }: ResizeImageNodeProps) {

    // Handle changes in the number inputs
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        // Convert value to number, default to 0 if invalid
        const numValue = parseInt(value, 10);
        data.onChange(id, { [name]: isNaN(numValue) ? 0 : numValue });
    };

    // Determine border style based on error state
    const isError = data.isError;
    const borderClass = isError
        ? 'border-[var(--color-danger-border)] shadow-lg shadow-red-500/20'
        : 'border-[var(--color-border-1)]';

    return (
        <div className={`
            w-[250px] rounded-lg shadow-md bg-[var(--color-surface-2)] text-[var(--color-text-1)]
            border ${borderClass}
        `}>
            {/* Header */}
            <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg flex items-center gap-2">
                <ResizeIcon />
                <p className="font-bold text-[var(--color-node-header-text)]">{data.label}</p>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 items-center">
                    <label htmlFor={`width-${id}`} className="block text-sm font-medium text-[var(--color-text-2)]">
                        Width (px)
                    </label>
                    <input
                        id={`width-${id}`}
                        name="width"
                        type="number"
                        min="1" // Ensure positive value
                        value={data.width ?? ''}
                        onChange={handleChange}
                        aria-label="Target width"
                        className={formElementClasses}
                    />
                </div>
                 <div className="grid grid-cols-2 gap-2 items-center">
                    <label htmlFor={`height-${id}`} className="block text-sm font-medium text-[var(--color-text-2)]">
                        Height (px)
                    </label>
                    <input
                        id={`height-${id}`}
                        name="height"
                        type="number"
                        min="1" // Ensure positive value
                        value={data.height ?? ''}
                        onChange={handleChange}
                        aria-label="Target height"
                        className={formElementClasses}
                    />
                </div>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-[var(--color-accent)]"
                aria-label="Image input"
            />
             <Handle
                type="source"
                position={Position.Right}
                className="!bg-[var(--color-accent)]"
                aria-label="Resized image output"
            />
        </div>
    );
}

export default ResizeImageNode;