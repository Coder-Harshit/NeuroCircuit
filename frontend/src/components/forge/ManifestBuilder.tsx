import { useState, useEffect } from "react";
import type {
    NodeManifest,
    IOType,
    ParamType,
    NodeInput,
    NodeOutput,
    NodeParam
} from "./types";

interface Props {
    onNext: (manifest: NodeManifest) => void;
    initialData?: NodeManifest;
}

const CATEGORIES = ["VISION", "DATA", "GENERAL", "CUSTOM"];
const IO_TYPES: IOType[] = ["IMAGE", "DATAFRAME", "STRING", "NUMBER", "ANY"];
const PARAM_TYPES: ParamType[] = ["string", "number", "boolean", "select"];

export default function ManifestBuilder({ onNext, initialData }: Props) {
    const [manifest, setManifest] = useState<NodeManifest>(
        initialData || {
            nodeType: "",
            label: "",
            category: "CUSTOM",
            description: "",
            inputs: [{ name: "input_1", type: "IMAGE" }],
            outputs: [{ name: "output_1", type: "IMAGE" }],
            params: [],
        }
    );

    // Auto-generate nodeType from label if empty
    useEffect(() => {
        if (!initialData && manifest.label) {
            const slug = manifest.label
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .replace(/\s+/g, "");
            setManifest((prev) => ({ ...prev, nodeType: slug }));
        }
    }, [manifest.label, initialData]);

    // --- Strict Typed Handler ---
    // This generic <K> ensures type safety for every specific field
    const updateField = <K extends keyof NodeManifest>(field: K, value: NodeManifest[K]) => {
        setManifest((prev) => ({ ...prev, [field]: value }));
    };

    const addInput = () => {
        const newInput: NodeInput = { name: `in_${manifest.inputs.length + 1}`, type: "ANY" };
        updateField("inputs", [...manifest.inputs, newInput]);
    };

    const addParam = () => {
        const newParam: NodeParam = { name: "new_param", type: "string", default: "" };
        updateField("params", [...manifest.params, newParam]);
    };

    // Helper to update specific item in array (inputs/outputs/params)
    const updateItemInArray = <T, K extends keyof T>(
        arrayField: keyof NodeManifest,
        index: number,
        key: K,
        value: T[K]
    ) => {
        const list = [...(manifest[arrayField] as unknown as T[])];
        list[index] = { ...list[index], [key]: value };
        // @ts-expect-error - Complex union type inference limitation, safe to cast
        updateField(arrayField, list);
    };

    return (
        <div className="flex h-full gap-4 p-4 text-(--color-text-1)">
            {/* --- LEFT: Form --- */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                <h2 className="text-2xl font-bold mb-4">Step 1: Node Design</h2>

                {/* Basic Info */}
                <div className="space-y-3 bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border-1)">
                    <h3 className="font-semibold text-(--color-accent)">Basic Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase font-bold text-(--color-text-2)">Label (Name)</label>
                            <input
                                className="w-full bg-(--color-surface-1) border border-(--color-border-1) rounded p-2 mt-1 focus:ring-2 ring-(--color-accent) outline-none"
                                value={manifest.label}
                                onChange={(e) => updateField("label", e.target.value)}
                                placeholder="e.g. Detect Faces"
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-(--color-text-2)">Category</label>
                            <select
                                className="w-full bg-(--color-surface-1) border border-(--color-border-1) rounded p-2 mt-1 outline-none"
                                value={manifest.category}
                                onChange={(e) => updateField("category", e.target.value)}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase font-bold text-(--color-text-2)">Description</label>
                        <textarea
                            className="w-full bg-(--color-surface-1) border border-(--color-border-1) rounded p-2 mt-1 outline-none text-sm"
                            rows={2}
                            value={manifest.description}
                            onChange={(e) => updateField("description", e.target.value)}
                        />
                    </div>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border-1)">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-(--color-accent)">Inputs</h3>
                            <button onClick={addInput} className="text-xs bg-(--color-surface-3) px-2 py-1 rounded hover:bg-(--color-accent) hover:text-white transition">+</button>
                        </div>
                        {manifest.inputs.map((inp, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    className="flex-1 bg-(--color-surface-1) border border-(--color-border-1) rounded px-2 py-1 text-sm"
                                    value={inp.name}
                                    onChange={(e) => updateItemInArray<NodeInput, "name">("inputs", idx, "name", e.target.value)}
                                />
                                <select
                                    className="w-24 bg-(--color-surface-1) border border-(--color-border-1) rounded px-1 text-sm"
                                    value={inp.type}
                                    onChange={(e) => updateItemInArray<NodeInput, "type">("inputs", idx, "type", e.target.value as IOType)}
                                >
                                    {IO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <button
                                    onClick={() => updateField("inputs", manifest.inputs.filter((...args) => args[1] !== idx))}
                                    className="text-red-500 hover:text-red-400 px-1"
                                >x</button>
                            </div>
                        ))}
                    </div>

                    {/* Outputs */}
                    <div className="bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border-1)">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-(--color-accent)">Outputs</h3>
                            <button onClick={() => updateField("outputs", [...manifest.outputs, { name: 'out', type: 'IMAGE' }])} className="text-xs bg-(--color-surface-3) px-2 py-1 rounded hover:bg-(--color-accent) hover:text-white transition">+</button>
                        </div>
                        {manifest.outputs.map((out, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input
                                    className="flex-1 bg-(--color-surface-1) border border-(--color-border-1) rounded px-2 py-1 text-sm"
                                    value={out.name}
                                    onChange={(e) => updateItemInArray<NodeOutput, "name">("outputs", idx, "name", e.target.value)}
                                />
                                <select
                                    className="w-24 bg-(--color-surface-1) border border-(--color-border-1) rounded px-1 text-sm"
                                    value={out.type}
                                    onChange={(e) => updateItemInArray<NodeOutput, "type">("outputs", idx, "type", e.target.value as IOType)}
                                >
                                    {IO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <button
                                    onClick={() => updateField("outputs", manifest.outputs.filter((...args) => args[1] !== idx))}
                                    className="text-red-500 hover:text-red-400 px-1"
                                >x</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Parameters */}
                <div className="bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border-1)">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-(--color-accent)">Parameters (Knobs)</h3>
                        <button onClick={addParam} className="text-xs bg-(--color-surface-3) px-2 py-1 rounded hover:bg-(--color-accent) hover:text-white transition">Add Param</button>
                    </div>
                    {manifest.params.length === 0 && <p className="text-sm text-(--color-text-2) italic">No parameters defined.</p>}
                    {manifest.params.map((param, idx) => (
                        <div key={idx} className="grid grid-cols-3 gap-2 mb-2 items-center">
                            <input
                                placeholder="Param Name"
                                className="bg-(--color-surface-1) border border-(--color-border-1) rounded px-2 py-1 text-sm"
                                value={param.name}
                                onChange={(e) => updateItemInArray<NodeParam, "name">("params", idx, "name", e.target.value)}
                            />
                            <select
                                className="bg-(--color-surface-1) border border-(--color-border-1) rounded px-1 text-sm"
                                value={param.type}
                                onChange={(e) => updateItemInArray<NodeParam, "type">("params", idx, "type", e.target.value as ParamType)}
                            >
                                {PARAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button
                                onClick={() => updateField("params", manifest.params.filter((...args) => args[1] !== idx))}
                                className="text-red-500 hover:text-red-400 text-right px-2"
                            >Remove</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- RIGHT: Live Preview --- */}
            <div className="w-1/3 flex flex-col h-full">
                <div className="bg-[#1e1e1e] rounded-lg border border-gray-700 flex-1 flex flex-col overflow-hidden">
                    <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-700">
                        manifest.json (Preview)
                    </div>
                    <pre className="p-4 text-xs font-mono text-green-400 overflow-auto flex-1">
                        {JSON.stringify(manifest, null, 2)}
                    </pre>
                </div>
                <button
                    onClick={() => onNext(manifest)}
                    disabled={!manifest.label || !manifest.nodeType}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transition-all"
                >
                    Next: Write Logic →
                </button>
            </div>
        </div>
    );
}