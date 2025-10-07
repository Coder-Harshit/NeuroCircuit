import type { ColorMode } from "@xyflow/react";

interface ThemeToggleProps {
    colorMode: ColorMode;
    setColorMode: (mode: ColorMode) => void;
}

// Simple SVG icons for Sun and Moon
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
);


export function ThemeToggle({ colorMode, setColorMode }: ThemeToggleProps) {
    const toggleTheme = () => {
        setColorMode(colorMode === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold p-2 rounded-full inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
        >
            <span className="sr-only">Toggle theme</span>
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
    );
}