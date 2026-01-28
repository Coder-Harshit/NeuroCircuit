import { useState } from "react";
import ManifestBuilder from "./ManifestBuilder";
import type { ForgeState } from "./types";
import LogicEditor from "./LogicEditor";

export default function ForgeLayout({ onExit }: { onExit: () => void }) {
    const [step, setStep] = useState<number>(1);
    const [manifest, setManifest] = useState<ForgeState | null>(null);
    const [, setPythonCode] = useState<string>("");

    // --- Handlers ---
    const handleManifestComplete = (data: ForgeState) => {
        setManifest(data);
        setStep(2);
    };

    return (
        <div className="fixed inset-0 z-50 bg-(--color-surface-1) flex flex-col">
            {/* Header */}
            <div className="h-14 border-b border-(--color-border-1) bg-(--color-surface-2) flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center font-bold text-white">
                        F
                    </div>
                    <h1 className="font-bold text-lg text-(--color-text-1)">NeuroCircuit Forge</h1>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-mono border border-blue-500/20">Developer Mode</span>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-(--color-accent)' : 'text-(--color-text-3)'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step >= s ? 'border-(--color-accent) bg-(--color-accent)/10' : 'border-(--color-border-1)'}`}>
                                {s}
                            </div>
                            <span className="text-sm font-medium hidden md:block">
                                {s === 1 && "Manifest"}
                                {s === 2 && "Logic"}
                                {s === 3 && "Review"}
                                {s === 4 && "Security"}
                            </span>
                            {s < 4 && <div className="w-8 h-px bg-(--color-border-1) mx-2" />}
                        </div>
                    ))}
                </div>

                <button
                    onClick={onExit}
                    className="text-(--color-text-2) hover:text-(--color-danger-text) font-medium text-sm"
                >
                    Exit Forge
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
                {step === 1 && (
                    <ManifestBuilder onNext={handleManifestComplete} initialData={manifest || undefined} />)
                }

                {step === 2 && manifest && (
                    <LogicEditor
                        manifest={manifest}
                        onBack={() => setStep(1)}
                        onNext={(code) => {
                            setPythonCode(code);
                            setStep(3); // Move to Review Step
                        }}
                    />
                )}

                {step === 3 && (
                    <div className="flex flex-col items-center justify-center h-full text-(--color-text-2)">
                        <p className="mb-4">AI Component Generation & Review Coming Next...</p>
                        <button onClick={() => setStep(2)} className="text-blue-500 underline">Back to Editor</button>
                    </div>
                )}
            </div>
        </div>
    );
}