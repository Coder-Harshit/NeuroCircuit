import { Handle, Position } from '@xyflow/react';
import type { ChangeEvent } from 'react';
// Import the type we'll create next
import type { CvtColorImageNodeProps } from '../../nodeTypes';

// Shared class for form elements
const formElementClasses = "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

// Simple Colorspace Icon (example - adjust as needed)
const ColorspaceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"></path></svg>;

const colorSpaceOptions = ["GRAY", "BGR", "RGB", "HSV", "LAB"];

function CvtColorImageNode({ id, data }: CvtColorImageNodeProps) {

    // Handle changes in the select dropdowns
    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = event.target;
        data.onChange(id, { [name]: value });
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
                <ColorspaceIcon />
                <p className="font-bold text-[var(--color-node-header-text)]">{data.label}</p>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
                {/* Input Colorspace Dropdown */}
                <div>
                    <label htmlFor={`in_colorspace-${id}`} className="block text-sm font-medium text-[var(--color-text-2)] mb-1">
                        From
                    </label>
                    <select
                        id={`in_colorspace-${id}`}
                        name="in_colorspace"
                        value={data.in_colorspace}
                        onChange={handleChange}
                        aria-label="Input colorspace"
                        className={formElementClasses}
                    >
                        {colorSpaceOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Output Colorspace Dropdown */}
                <div>
                    <label htmlFor={`out_colorspace-${id}`} className="block text-sm font-medium text-[var(--color-text-2)] mb-1">
                        To
                    </label>
                    <select
                        id={`out_colorspace-${id}`}
                        name="out_colorspace"
                        value={data.out_colorspace}
                        onChange={handleChange}
                        aria-label="Output colorspace"
                        className={formElementClasses}
                    >
                        {colorSpaceOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
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
                aria-label="Converted image output"
            />
        </div>
    );
}

export default CvtColorImageNode;