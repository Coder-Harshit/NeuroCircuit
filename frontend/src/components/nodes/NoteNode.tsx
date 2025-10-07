import type { ChangeEvent } from 'react';
import type { NoteNodeProps } from '../../nodeTypes';

function NoteNode({ id, data }: NoteNodeProps ) {
    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>)=> {
        data.onChange(id,{label: event.target.value});
    };

  return (
    <div className="bg-yellow-200 border border-yellow-400 rounded-md shadow-md w-[250px]">
      <textarea
        value={data.label}
        onChange={handleChange}
        aria-label="Note"
        className="nodrag w-full h-full p-2 bg-transparent resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        rows={5}
        placeholder="Type your note..."
      />
    </div>
  );
}

export default NoteNode;