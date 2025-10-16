import { Handle, Position } from '@xyflow/react';
import type { ChangeEvent } from 'react';
import type { InputNodeProps } from '../../nodeTypes';

const formElementClasses = "nodrag w-full p-2 border rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

function InputNode({ id, data }: InputNodeProps ) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>)=> {
        data.onChange(id, { filePath: event.target.value });
    };

  return (
    <div className="w-[300px] rounded-lg shadow-md bg-[var(--color-surface-2)] border border-[var(--color-border-1)] text-[var(--color-text-1)]">
      <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg">
        <p className="font-bold text-[var(--color-node-header-text)]">{data.label}</p>
      </div>
      <div className="p-4 space-y-2">
        <label htmlFor="filePath" className="block text-sm font-medium text-[var(--color-text-2)]">
          File Path
       </label>
        <input
          id="filePath"
          name="filePath"
          value={data.filePath ?? ''}
          onChange={handleChange}
          aria-label="File path"
          className={formElementClasses}
        />
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[var(--color-accent)]" />
    </div>
  );
}

export default InputNode;