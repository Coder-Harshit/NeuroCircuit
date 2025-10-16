import { useState, useMemo, useEffect, useRef } from 'react';
import type { ContextMenuProps, MenuAction } from '../../types';

export default function ContextMenu({ top, left, actions }: ContextMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus the search input when the menu opens
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filteredAndGroupedActions = useMemo(() => {
    const filtered = actions.filter(action =>
      action.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      action.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by category
    return filtered.reduce((acc, action) => {
      const category = action.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(action);
      return acc;
    }, {} as Record<string, MenuAction[]>);
  }, [actions, searchTerm]);

  const categories = Object.keys(filteredAndGroupedActions).sort();

  return (
    <div
      className="absolute w-64 rounded-lg shadow-2xl z-30 bg-[var(--color-surface-2)] border border-[var(--color-border-1)] text-[var(--color-text-1)] flex flex-col"
      style={{ top: `${top}px`, left: `${left}px` }}
      role="menu"
      aria-label="Add node menu"
    >
      <div className="p-2 border-b border-[var(--color-border-1)]">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1.5 rounded-md bg-[var(--color-surface-3)] border border-[var(--color-border-2)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
      </div>

      <ul className="py-1 flex-grow overflow-y-auto max-h-[400px]">
        {categories.length > 0 ? (
          categories.map(category => (
            <li key={category} role="none" className="px-2 pt-2">
              <p className="px-2 text-xs font-bold uppercase text-[var(--color-text-3)] tracking-wider">{category}</p>
              <ul>
                {filteredAndGroupedActions[category].map(({ label, onSelect }) => (
                  <li key={label} role="none">
                    <button
                      role="menuitem"
                      onClick={onSelect}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); }}
                      className="w-full text-left my-1 px-2 py-1.5 text-sm rounded text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-1)] focus:outline-none focus:bg-[var(--color-surface-3)]"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))
        ) : (
          <li className="p-4 text-center text-sm text-[var(--color-text-3)]">No nodes found.</li>
        )}
      </ul>
    </div>
  );
}