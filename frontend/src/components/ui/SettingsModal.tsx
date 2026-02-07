import { useEffect, useState } from "react";
import type { SearchSettings } from "../../types";
import { CloseIcon, GearIcon } from "./icons";

type SettingsModalProps = {
  onClose: () => void;
  settings: SearchSettings;
  setSettings: (
    settings: SearchSettings | ((prev: SearchSettings) => SearchSettings),
  ) => void;
};


const SectionHeader = ({ title }: { title: string }) => (
  <div className="pb-2 mb-4 border-b border-(--color-border-1)">
    <h3 className="text-xs font-bold uppercase tracking-widest text-(--color-text-2)">
      {title}
    </h3>
  </div>
);

const Switch = ({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
}) => (
  <label
    htmlFor={id}
    className="relative inline-flex items-center cursor-pointer shrink-0"
  >
    <input
      type="checkbox"
      id={id}
      className="sr-only peer"
      checked={checked}
      onChange={onChange}
    />
    <div className="w-11 h-6 bg-(--color-surface-3) peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-(--color-accent) peer-focus:ring-offset-2 peer-focus:ring-offset-(--color-surface-1) rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-accent)"></div>
  </label>
);


function SettingsModal({ onClose, settings, setSettings }: SettingsModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 10000) val = 10000;
    setSettings((prev) => ({ ...prev, delay: val }));
  };

  const percentage = Math.min((settings.delay / 10000) * 100, 100);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"
        }`}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className={`relative w-full max-w-md bg-(--color-surface-2) text-(--color-text-1) rounded-2xl shadow-2xl border border-(--color-border-1) overflow-hidden transform transition-all duration-200 ease-out ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-(--color-surface-1)/50 border-b border-(--color-border-1)">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-(--color-surface-3) rounded-lg text-(--color-accent)">
              <GearIcon />
            </div>
            <div>
              <h2 className="text-lg font-bold text-(--color-text-1) leading-tight">
                Preferences
              </h2>
              <p className="text-xs text-(--color-text-2)">
                Customize your experience
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="group p-2 rounded-full text-(--color-text-2) hover:bg-(--color-surface-3) hover:text-(--color-text-1) transition-all duration-200"
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

          {/* Section: Search Behavior */}
          <section>
            <SectionHeader title="Search Behavior" />
            <div className="space-y-6">

              {/* Fuzzy Search */}
              <div className="flex items-center justify-between group">
                <div className="pr-4">
                  <label
                    htmlFor="fuzzy-toggle"
                    className="font-medium block text-(--color-text-1) group-hover:text-(--color-accent) transition-colors"
                  >
                    Fuzzy Search
                  </label>
                  <p className="text-sm text-(--color-text-2) mt-1 leading-relaxed">
                    Allow approximate matches (e.g., "cim" → "Create Image").
                  </p>
                </div>
                <Switch
                  id="fuzzy-toggle"
                  checked={settings.fuzzy}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      fuzzy: e.target.checked,
                    }))
                  }
                />
              </div>

              {/* THE MASTER TIMER COMPONENT */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-end">
                  <label className="font-medium text-(--color-text-1)">
                    Auto-Select Timer
                  </label>
                  {/* Status Text Indicator */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${settings.delay === 0 ? "text-(--color-text-3)" : "text-(--color-accent)"
                    }`}>
                    {settings.delay === 0
                      ? "Manual Selection Only"
                      : settings.delay < 1000 ? "Turbo Mode" : "Auto-Confirm"}
                  </span>
                </div>

                {/* The "Luminous Tactile" Container */}
                <div
                  className={`relative flex items-center w-full h-14 rounded-xl border transition-all duration-300 ${settings.delay === 0
                      ? "bg-(--color-surface-1) border-(--color-border-2)"
                      : "bg-(--color-surface-2) border-(--color-accent)/30 shadow-[0_4px_20px_-8px_rgba(var(--color-accent-rgb),0.2)]"
                    }`}
                >
                  {/* Icon Area */}
                  <div className={`pl-4 pr-2 transition-colors duration-300 ${settings.delay === 0 ? "text-(--color-text-3)" : "text-(--color-accent)"
                    }`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>

                  {/* Slider Track Area */}
                  <div className="relative grow h-full flex items-center px-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={settings.delay}
                      onChange={handleDelayChange}
                      className="w-full h-2 bg-(--color-surface-3) rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-0"
                      style={{
                        // This creates the "Fill" effect perfectly aligned with the thumb
                        backgroundImage: `linear-gradient(var(--color-accent), var(--color-accent))`,
                        backgroundSize: `${percentage}% 100%`,
                        backgroundRepeat: "no-repeat",
                      }}
                    />

                  </div>

                  {/* Input Readout Area */}
                  <div className="min-w-20 px-3 flex justify-end items-center shrink-0">
                    {settings.delay === 0 ? (
                      <span className="text-xs font-bold text-(--color-text-3) tracking-wider">
                        OFF
                      </span>
                    ) : (
                      <div className="flex items-baseline justify-end gap-1 group/input">
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          value={settings.delay}
                          onChange={handleDelayChange}
                          className="w-14 bg-transparent text-right font-mono font-bold text-base text-(--color-text-1) focus:outline-none focus:text-(--color-accent) border-none appearance-none transition-colors [-moz-appearance:textfield]"
                          style={{
                            padding: '0',
                            margin: '0',
                          }}
                        />
                        <span className="text-xs font-medium text-(--color-text-2) group-focus-within/input:text-(--color-accent) transition-colors whitespace-nowrap shrink-0">
                          ms
                        </span>
                      </div>
                    )}
                    {/* Spinner Killer */}
                    <style>{`
                        input[type=number]::-webkit-inner-spin-button, 
                        input[type=number]::-webkit-outer-spin-button { 
                          -webkit-appearance: none; 
                          margin: 0; 
                        }
                     `}</style>
                  </div>
                </div>

                <p className="text-xs text-(--color-text-2) pl-1">
                  Set to 0 to disable.
                </p>
              </div>

            </div>
          </section>

          {/* Section: Interface */}
          <section>
            <SectionHeader title="Interface" />
            <div className="space-y-5">

              <div className="flex items-center justify-between group">
                <div>
                  <label htmlFor="text-display-toggle" className="font-medium block text-(--color-text-1) group-hover:text-(--color-accent) transition-colors">
                    Show Button Labels
                  </label>
                  <p className="text-sm text-(--color-text-2) mt-1">
                    Show text descriptions in the toolbar.
                  </p>
                </div>
                <Switch
                  id="text-display-toggle"
                  checked={settings.textDisplay}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, textDisplay: e.target.checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between group">
                <div>
                  <label htmlFor="icon-display-toggle" className="font-medium block text-(--color-text-1) group-hover:text-(--color-accent) transition-colors">
                    Show Button Icons
                  </label>
                  <p className="text-sm text-(--color-text-2) mt-1">
                    Show visual icons in the toolbar.
                  </p>
                </div>
                <Switch
                  id="icon-display-toggle"
                  checked={settings.iconDisplay}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, iconDisplay: e.target.checked }))
                  }
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-(--color-surface-1)/30 border-t border-(--color-border-1) text-center">
          <p className="text-xs text-(--color-text-2)/60">
            Press <kbd className="font-sans font-semibold text-(--color-text-2)">ESC</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;