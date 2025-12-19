import { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import type { ContextMenuProps } from "../../types";

// Helper: Fuzzy Search
function fuzzysearch(text: string, search: string) {
  const searchLower = search.toLowerCase();
  const textLower = text.toLowerCase();

  if (!searchLower) return true;

  let searchIndx = 0;
  for (let txtIndx = 0; txtIndx < textLower.length; txtIndx++) {
    if (textLower[txtIndx] === searchLower[searchIndx]) {
      searchIndx++;
      if (searchIndx === searchLower.length) return true;
    }
  }
  return false;
}

export default function ContextMenu({
  top,
  left,
  actions,
  searchSettings,
  onClose,
}: ContextMenuProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedLeft, setAdjustedLeft] = useState(left);

  // If opening the menu goes off-screen to the right, flip it to open to the left
  useLayoutEffect(() => {
    if (menuRef.current) {
      const width = menuRef.current.offsetWidth;
      const windowWidth = window.innerWidth;
      if (left + width > windowWidth - 20) {
        setAdjustedLeft(left - width);
      }
    }
  }, [left]);

  // Focus search on mount
  useEffect(() => {
    const timer = setTimeout(() => searchInputRef.current?.focus(), 10);
    return () => clearTimeout(timer);
  }, []);

  // --- Filter & Sort ---
  const filteredActions = useMemo(() => {
    const filtered = actions.filter((action) => {
      if (!searchSettings.fuzzy) {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          action.label.toLowerCase().includes(lowerSearch) ||
          action.category?.toLowerCase().includes(lowerSearch) ||
          action.description?.toLowerCase().includes(lowerSearch)
        );
      }
      return (
        fuzzysearch(action.label, searchTerm) ||
        (action.category && fuzzysearch(action.category, searchTerm)) ||
        (action.description &&
          fuzzysearch(
            action.description,
            searchTerm,
          ))
      );
    });

    return filtered.sort((a, b) => {
      const catA = a.category || "General";
      const catB = b.category || "General";
      if (catA !== catB) return catA.localeCompare(catB);
      return a.label.localeCompare(b.label);
    });
  }, [actions, searchTerm, searchSettings.fuzzy]);

  // Reset selection on filter change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredActions]);

  // --- Auto-Select ---
  useEffect(() => {
    if (searchSettings.delay <= 0) return;

    let timer: number | undefined;
    if (filteredActions.length === 1 && searchTerm.length > 0) {
      timer = setTimeout(() => {
        filteredActions[0].onSelect();
      }, searchSettings.delay);
    }
    return () => clearTimeout(timer);
  }, [filteredActions, searchTerm, searchSettings.delay]);

  // --- Scroll active into view ---
  useEffect(() => {
    if (listRef.current) {
      const activeItem = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      );
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "Enter", "Escape", "Tab"].includes(e.key)) {
      e.preventDefault();
    }
    switch (e.key) {
      case "ArrowDown":
      case "Tab":
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
        break;
      case "ArrowUp":
        setSelectedIndex((prev) =>
          prev === 0 ? filteredActions.length - 1 : prev - 1,
        );
        break;
      case "Enter":
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].onSelect();
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  const selectedAction = filteredActions[selectedIndex];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 flex overflow-hidden rounded-xl border border-[var(--color-border-1)] bg-[var(--color-surface-2)] shadow-2xl animate-in fade-in zoom-in-95 duration-100 ease-out backdrop-blur-sm"
      style={{
        top: `${top}px`,
        left: `${adjustedLeft}px`,
        width: "550px",
        height: "360px",
      }}
      role="menu"
      aria-label="Node selection menu"
      onClick={(e) => e.stopPropagation()}
    >
      {/* === LEFT COLUMN: Search & List === */}
      <div className="flex w-[60%] flex-col border-r border-[var(--color-border-1)]">
        {/* Search Bar */}
        <div className="p-3 border-b border-[var(--color-border-1)] bg-[var(--color-surface-2)]">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-md bg-[var(--color-surface-3)] border border-[var(--color-border-2)] py-2 pl-9 pr-3 text-sm focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] text-[var(--color-text-1)] placeholder-[var(--color-text-3)]"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-3)]"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>

        {/* Node List */}
        <div
          ref={listRef}
          className="flex-grow overflow-y-auto p-2 scroll-smooth bg-[var(--color-surface-2)]"
        >
          {filteredActions.length > 0 ? (
            filteredActions.map((action, index) => {
              const prevCategory =
                index > 0 ? filteredActions[index - 1].category : null;
              const currentCategory = action.category || "General";
              const showHeader =
                index === 0 || currentCategory !== prevCategory;
              const isActive = index === selectedIndex;

              return (
                <div key={`${action.label}-${index}`}>
                  {showHeader && (
                    <div className="sticky top-0 z-10 bg-[var(--color-surface-2)]/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-3)]">
                      {currentCategory}
                    </div>
                  )}

                  <button
                    data-index={index}
                    onClick={() => action.onSelect()}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`
                      w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-all duration-75
                      ${
                        isActive
                          ? "bg-[var(--color-accent)] text-white shadow-sm scale-[0.99]"
                          : "text-[var(--color-text-1)] hover:bg-[var(--color-surface-3)]"
                      }
                    `}
                  >
                    <span className="truncate">{action.label}</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-[var(--color-text-3)] opacity-60">
              <p className="text-sm">No results found</p>
            </div>
          )}
        </div>
      </div>

      {/* === RIGHT COLUMN: Details & Preview === */}
      <div className="flex w-[40%] flex-col justify-between bg-[var(--color-surface-3)] p-5">
        {selectedAction ? (
          <div className="flex flex-col gap-4 animate-in slide-in-from-left-2 duration-200 fade-in">
            {/* Header Info */}
            <div>
              <div className="mb-2 inline-flex items-center rounded-full border border-[var(--color-border-2)] bg-[var(--color-surface-1)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-2)]">
                {selectedAction.category || "General"}
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text-1)] leading-tight">
                {selectedAction.label}
              </h3>
            </div>

            {/* Description */}
            <div className="text-sm leading-relaxed text-[var(--color-text-2)]">
              {selectedAction.description ? (
                selectedAction.description
              ) : (
                <span className="italic opacity-50">
                  No description available.
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-sm text-[var(--color-text-3)]">
            <p>Select a node to view details</p>
          </div>
        )}

        {/* Shortcuts Footer */}
        <div className="mt-auto pt-4 border-t border-[var(--color-border-2)]">
          <div className="flex flex-col gap-2 text-[11px] text-[var(--color-text-3)]">
            <div className="flex items-center justify-between">
              <span>Navigate</span>
              <div className="flex gap-1">
                <Kbd>↑</Kbd> <Kbd>↓</Kbd>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Select</span>
              <Kbd>↵ Enter</Kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Close</span>
              <Kbd>Esc</Kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// helper component for Keyboard keys
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="min-w-[20px] rounded border border-[var(--color-border-2)] bg-[var(--color-surface-1)] px-1 text-center font-sans shadow-sm">
      {children}
    </kbd>
  );
}
