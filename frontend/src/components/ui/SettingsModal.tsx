import { useEffect } from "react";
import type { SearchSettings } from "../../types";

type SettingsModalProps = {
  onClose: () => void;
  settings: SearchSettings;
  setSettings: (
    settings: SearchSettings | ((prev: SearchSettings) => SearchSettings),
  ) => void;
};

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
const GearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

function SettingsModal({ onClose, settings, setSettings }: SettingsModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 0;

    // 0 and 10s
    if (val < 0) val = 0;
    if (val > 10000) val = 10000;

    setSettings((prev) => ({ ...prev, delay: val }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-[var(--color-surface-2)] text-[var(--color-text-1)] rounded-lg shadow-xl border border-[var(--color-border-1)] m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-1)]">
          <div className="flex items-center gap-2">
            <GearIcon />
            <h2 className="text-lg font-bold">Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-1)]"
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Fuzzy Search */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="fuzzy-toggle" className="font-medium block">
                Fuzzy Search
              </label>
              <p className="text-xs text-[var(--color-text-2)]">
                Match partial names (e.g. "cim" → "Create Image")
              </p>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                name="fuzzy-toggle"
                id="fuzzy-toggle"
                checked={settings.fuzzy}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, fuzzy: e.target.checked }))
                }
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                style={{
                  right: settings.fuzzy ? "0" : "unset",
                  left: settings.fuzzy ? "unset" : "0",
                  borderColor: settings.fuzzy ? "var(--color-accent)" : "#ccc",
                }}
              />
              <label
                htmlFor="fuzzy-toggle"
                className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                style={{
                  backgroundColor: settings.fuzzy
                    ? "var(--color-accent)"
                    : "#e5e7eb",
                }}
              ></label>
            </div>
          </div>

          {/* Auto Select Timer */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="delay-input" className="font-medium block">
                Auto-Select Timer
              </label>
              <span className="text-xs font-mono bg-[var(--color-surface-3)] px-2 py-1 rounded">
                {settings.delay === 0 ? "Disabled" : `${settings.delay}ms`}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-2)]">
              Automatically select the node if it's the only result. Set to 0 to
              disable. (Max 10s)
            </p>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={settings.delay > 2000 ? 2000 : settings.delay} // Visual cap for slider, but input allows more
              onChange={handleDelayChange}
              className="w-full h-2 bg-[var(--color-surface-3)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-[var(--color-text-2)]">
                Manual (ms):
              </span>
              <input
                id="delay-input"
                type="number"
                min="0"
                max="10000"
                value={settings.delay}
                onChange={handleDelayChange}
                className="w-24 px-2 py-1 text-sm rounded border border-[var(--color-border-2)] bg-[var(--color-surface-1)] focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
