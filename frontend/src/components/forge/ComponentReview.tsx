import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { ForgeState } from "./types";

interface Props {
    manifest: ForgeState;
    pythonCode: string;
    onBack: () => void;
    // onInstall: (finalCode: string) => void;
}

export default function ComponentReview({ manifest, pythonCode, onBack }: Props) {
    const [code, setCode] = useState("// Generating Component...");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const handleInstall = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/forge/install", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    manifest: manifest, // Send full state
                    pythonCode: pythonCode,
                    reactCode: code // The code from the editor
                })
            });

            if (!res.ok) throw new Error(await res.text());

            // const result = await res.json();
            alert("🎉 Success! Node Installed.\n\nThe app will now reload to apply changes.");

            // Optional: Trigger full page reload to pick up new registry
            window.location.reload();

        } catch (err) {
            alert("Installation Failed: " + err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchGeneration = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/forge/generate-frontend", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nodeType: manifest.nodeType,
                        label: manifest.label,
                        description: manifest.description,
                        inputs: manifest.inputs,
                        outputs: manifest.outputs || [],
                        pythonCode: pythonCode
                    })
                });

                const data = await res.json();
                if (data.code) {
                    setCode(data.code);
                } else {
                    throw new Error("No code returned from backend");
                }
            } catch (err) {
                console.error(err);
                setError("Failed to generate code. Please check if backend is running.");
                setCode("// Error generating code. You can write it manually here.");
            } finally {
                setIsLoading(false);
            }
        };

        // Only fetch if we haven't generated yet
        if (isLoading) {
            fetchGeneration();
        }
    }, [isLoading, manifest.description, manifest.inputs, manifest.label, manifest.nodeType, manifest.outputs, pythonCode]);

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4]">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42]">
                <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-mono text-sm">
                        frontend/src/components/nodes/{manifest.nodeType}Node.tsx
                    </span>
                    {isLoading && <span className="text-xs text-yellow-500 animate-pulse">✨ Generating with AI...</span>}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onBack}
                        className="px-3 py-1 text-sm hover:bg-[#3e3e42] rounded transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleInstall}
                        disabled={isLoading}
                        className="px-4 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-lg"
                    >
                        Install Node 🚀
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 relative">
                <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        padding: { top: 16 },
                    }}
                />
                {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-100 p-3 rounded border border-red-700">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}