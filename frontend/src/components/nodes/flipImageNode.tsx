import { Handle, Position } from '@xyflow/react';
import type { ChangeEvent } from 'react';
// Import the type we'll create next
import type { FlipImageNodeProps } from '../../nodeTypes';

// Simple Flip Icon (example)
const FlipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="m16 6-4-4-4 4" /><path d="m8 18 4 4 4-4" /><path d="m3 12 18 0" /></svg>;


function FlipImageNode({ id, data }: FlipImageNodeProps) {

    // Handle changes in the checkboxes
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        data.onChange(id, { [name]: checked });
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
                <FlipIcon />
                <p className="font-bold text-[var(--color-node-header-text)]">{data.label}</p>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
                <div className="flex items-center">
                    <input
                        id={`horizontal-${id}`}
                        name="horizontal"
                        type="checkbox"
                        checked={data.horizontal ?? false}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                    <label htmlFor={`horizontal-${id}`} className="select-none text-sm font-medium text-[var(--color-text-2)]">
                        Flip Horizontal (Left/Right)
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                        id={`vertical-${id}`}
                        name="vertical"
                        type="checkbox"
                        checked={data.vertical ?? false}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                    <label htmlFor={`vertical-${id}`} className="select-none text-sm font-medium text-[var(--color-text-2)]">
                        Flip Vertical (Up/Down)
                    </label>
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
                aria-label="Flipped image output"
            />
        </div>
    );
}

export default FlipImageNode;