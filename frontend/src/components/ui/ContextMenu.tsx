import { type ContextMenuProps } from "../../types";

export default function ContextMenu({ top, left, actions }: ContextMenuProps) {
  return (
    <div
      className="absolute bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10"
      style={{ top: `${top}px`, left: `${left}px` }}
      role="menu"
      aria-label="Add node menu"
    >
      <ul className="py-1">
        {actions.map(({ label, onSelect }) => (
          <li key={label} role="none">
            <button
              role="menuitem"
              onClick={onSelect}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); }}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}