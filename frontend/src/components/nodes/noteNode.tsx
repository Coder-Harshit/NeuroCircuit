import type { ChangeEvent } from 'react';
import type { NoteNodeProps } from '../../nodeTypes';

function NoteNode({ id, data }: NoteNodeProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    data.onChange(id, { label: event.target.value });
  };

  return (
    <div
      className={`
        w-[250px] nodrag rounded-lg shadow-md
        bg-[var(--color-note-surface)] text-[var(--color-note-text)]
        border-2 resize overflow-auto
      `}
    >
      <textarea
        value={data.label}
        onChange={handleChange}
        aria-label="Note"
        className="nodrag w-full h-full p-3 bg-transparent resize-none focus:outline-none placeholder:text-current/60"
        rows={5}
        placeholder="Type your note..."
      />
    </div>
  );
}

export default NoteNode;