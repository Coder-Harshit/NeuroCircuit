import { useState, useEffect, useMemo } from "react";
import type {
    ForgeState,
    IOType,
    ParamType,
    NodeInput,
    // NodeOutput,
    NodeParam,
    SavedManifest
} from "./types";

interface Props {
    onNext: (forgeState: ForgeState) => void;
    initialData?: ForgeState;
}

const CATEGORIES = ["VISION", "DATA", "GENERAL", "CUSTOM"];
const IO_TYPES: IOType[] = ["IMAGE", "DATAFRAME", "STRING", "NUMBER", "ANY"];
const PARAM_TYPES: ParamType[] = ["string", "number", "boolean", "select"];

export default function ManifestBuilder({ onNext, initialData }: Props) {
    const [state, setState] = useState<ForgeState>(
        initialData || {
            nodeType: "",
            label: "",
            category: "CUSTOM",
            description: "",
            dependencies: [],
            inputs: [{ name: "input_1", type: "IMAGE" }],
            // outputs: [{ name: "output_1", type: "IMAGE" }],
            params: [],
        }
    );

    const [newDep, setNewDep] = useState("");

    useEffect(() => {
        if (!initialData && state.label) {
            const slug = state.label
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "")
                .replace(/\s+/g, "");
            setState((prev) => ({ ...prev, nodeType: slug }));
        }
    }, [state.label, initialData]);

    // --- Strict Typed Handler ---
    // This generic <K> ensures type safety for every specific field
    const updateField = <K extends keyof ForgeState>(field: K, value: ForgeState[K]) => {
        setState((prev) => ({ ...prev, [field]: value }));
    };
    // --- Dependency Handlers ---
    const addDependency = () => {
        if (newDep && !state.dependencies.includes(newDep)) {
            updateField("dependencies", [...state.dependencies, newDep]);
            setNewDep("");
        }
    };
    const removeDependency = (dep: string) => {
        updateField("dependencies", state.dependencies.filter(d => d !== dep));
    };

    // Helper to update specific item in array (inputs/outputs/params)
    const updateItemInArray = <T, K extends keyof T>(
        arrayField: keyof ForgeState,
        index: number,
        key: K,
        value: T[K]
    ) => {
        const list = [...(state[arrayField] as unknown as T[])];
        list[index] = { ...list[index], [key]: value };
        // @ts-expect-error - Complex union type inference limitation
        updateField(arrayField, list);
    };

    // const addInput = () => {
    //     const newInput: NodeInput = { name: `in_${state.inputs.length + 1}`, type: "ANY" };
    //     updateField("inputs", [...state.inputs, newInput]);
    // };

    // const addParam = () => {
    //     const newParam: NodeParam = { name: "new_param", type: "string", default: "" };
    //     updateField("params", [...state.params, newParam]);
    // };

    const previewJson: SavedManifest = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const defaultData: Record<string, any> = {
            label: state.label || "My Node"
        };

        // Flatten params into defaultData
        state.params.forEach(p => {
            defaultData[p.name] = p.default;
        });

        return {
            nodeType: state.nodeType,
            label: state.label,
            category: state.category,
            description: state.description,
            dependencies: state.dependencies,
            defaultData: defaultData
        };
    }, [state]);

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
                                value={state.label}
                                onChange={(e) => updateField("label", e.target.value)}
                                placeholder="e.g. Detect Faces"
                            />
                        </div>
                        <div>
                            <label className="text-xs uppercase font-bold text-(--color-text-2)">Category</label>
                            <select
                                className="w-full bg-(--color-surface-1) border border-(--color-border-1) rounded p-2 mt-1 outline-none"
                                value={state.category}
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
                            value={state.description}
                            onChange={(e) => updateField("description", e.target.value)}
                        />
                    </div>
                </div>

                {/* Dependencies */}
                <div className="bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border-1)">
                    <h3 className="font-semibold text-(--color-accent) mb-2">Python Dependencies (Pip)</h3>
                    <div className="flex gap-2 mb-2">
                        <input
                            className="flex-1 bg-(--color-surface-1) border border-(--color-border-1) rounded px-2 py-1 text-sm"
                            placeholder="e.g. opencv-python-headless"
                            value={newDep}
                            onChange={(e) => setNewDep(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addDependency()}
                        />
                        <button onClick={addDependency} className="bg-(--color-surface-3) px-3 rounded hover:bg-(--color-accent) hover:text-white transition">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {state.dependencies.map(dep => (
                            <span key={dep} className="px-2 py-1 bg-(--color-surface-1) border border-(--color-border-1) rounded text-xs flex items-center gap-2">
                                {dep}
                                <button onClick={() => removeDependency(dep)} className="text-red-400 hover:text-red-300 font-bold">x</button>
                            </span>
                        ))}
                        {state.dependencies.length === 0 && <span className="text-xs text-(--color-text-2) italic">No external dependencies.</span>}
                    </div>
                </div>

                {/* 3. Inputs & Outputs (Used for Code Gen, NOT saved in JSON) */}
                <div className="gap-4">
                    <div className="bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border-1)">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-(--color-accent)">Inputs</h3>
                            <button onClick={() => updateField("inputs", [...state.inputs, { name: `in_${state.inputs.length + 1}`, type: "ANY" }])} className="text-xs bg-(--color-surface-3) px-2 py-1 rounded hover:bg-(--color-accent) hover:text-white">+</button>
                        </div>
                        {state.inputs.map((inp, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input className="flex-1 bg-(--color-surface-1) border border-(--color-border-1) rounded px-2 py-1 text-sm" value={inp.name} onChange={e => updateItemInArray<NodeInput, "name">("inputs", idx, "name", e.target.value)} />
                                <select className="w-24 bg-(--color-surface-1) border border-(--color-border-1) rounded px-1 text-sm" value={inp.type} onChange={e => updateItemInArray<NodeInput, "type">("inputs", idx, "type", e.target.value as IOType)}>
                                    {IO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <button onClick={() => updateField("inputs", state.inputs.filter((...args) => args[1] !== idx))} className="text-red-500 hover:text-red-400 px-1">×</button>
                            </div>
                        ))}
                    </div>

                    {/* <div className="bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border-1)">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-(--color-accent)">Outputs</h3>
                            <button onClick={() => updateField("outputs", [...state.outputs, { name: `out`, type: "ANY" }])} className="text-xs bg-(--color-surface-3) px-2 py-1 rounded hover:bg-(--color-accent) hover:text-white">+</button>
                        </div>
                        {state.outputs.map((out, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input className="flex-1 bg-(--color-surface-1) border border-(--color-border-1) rounded px-2 py-1 text-sm" value={out.name} onChange={(e) => updateItemInArray<NodeOutput, "name">("outputs", idx, "name", e.target.value)} />
                                <select className="w-24 bg-(--color-surface-1) border border-(--color-border-1) rounded px-1 text-sm" value={out.type} onChange={e => updateItemInArray<NodeOutput, "type">("outputs", idx, "type", e.target.value as IOType)}>
                                    {IO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <button onClick={() => updateField("outputs", state.outputs.filter((...args) => args[1] !== idx))} className="text-red-500 hover:text-red-400 px-1">×</button>
                            </div>
                        ))}
                    </div> */}
                </div>

                {/* Inputs */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border-1)">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-(--color-accent)">Inputs</h3>
                            <button onClick={addInput} className="text-xs bg-(--color-surface-3) px-2 py-1 rounded hover:bg-(--color-accent) hover:text-white transition">+</button>
                        </div>
                        {state.inputs.map((inp, idx) => (
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
                                    onClick={() => updateField("inputs", state.inputs.filter((...args) => args[1] !== idx))}
                                    className="text-red-500 hover:text-red-400 px-1"
                                >x</button>
                            </div>
                        ))}
                    </div> */}

                {/* Outputs */}
                {/* <div className="bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border-1)">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-(--color-accent)">Outputs</h3>
                            <button onClick={() => updateField("outputs", [...state.outputs, { name: 'out', type: 'IMAGE' }])} className="text-xs bg-(--color-surface-3) px-2 py-1 rounded hover:bg-(--color-accent) hover:text-white transition">+</button>
                        </div>
                        {state.outputs.map((out, idx) => (
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
                                    onClick={() => updateField("outputs", state.outputs.filter((...args) => args[1] !== idx))}
                                    className="text-red-500 hover:text-red-400 px-1"
                                >x</button>
                            </div>
                        ))}
                    </div>
                </div> */}

                {/* Parameters (Mapped to defaultData) */}
                <div className="bg-(--color-surface-2) p-4 rounded-lg border border-(--color-border-1)">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-(--color-accent)">Parameters (Default Data)</h3>
                        <button onClick={() => updateField("params", [...state.params, { name: "new_param", type: "string", default: "" }])} className="text-xs bg-(--color-surface-3) px-2 py-1 rounded hover:bg-(--color-accent) hover:text-white">Add Param</button>
                        {/* <button onClick={addParam} className="text-xs bg-(--color-surface-3) px-2 py-1 rounded hover:bg-(--color-accent) hover:text-white transition">Add Param</button> */}
                    </div>
                    {/* {state.params.length === 0 && <p className="text-sm text-(--color-text-2) italic">No parameters defined.</p>} */}
                    {state.params.map((param, idx) => (
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
                                onClick={() => updateField("params", state.params.filter((...args) => args[1] !== idx))}
                                className="text-red-500 hover:text-red-400 text-right px-2"
                            >Remove</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- RIGHT COLUMN: Preview --- */}
            <div className="w-1/3 flex flex-col h-full">
                <div className="bg-[#1e1e1e] rounded-lg border border-gray-700 flex-1 flex flex-col overflow-hidden">
                    <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-700 flex justify-between">
                        <span>manifest.json (Preview)</span>
                        <span className="text-yellow-500" title="Inputs will be used for code generation but NOT saved here.">⚠️ Strict Format</span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-green-400 overflow-auto flex-1">
                        {JSON.stringify(previewJson, null, 2)}
                    </pre>
                </div>
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded text-xs text-blue-300">
                    <strong>Note:</strong> Inputs are not saved in JSON. They are used to generate the React Component and Python Logic in the next steps.
                </div>
                <button
                    onClick={() => onNext(state)}
                    disabled={!state.label || !state.nodeType}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transition-all"
                >
                    Next: Write Logic →
                </button>
            </div>
        </div>
    );
}

// {/* --- RIGHT: Live Preview --- */ }
// <div className="w-1/3 flex flex-col h-full">
//     <div className="bg-[#1e1e1e] rounded-lg border border-gray-700 flex-1 flex flex-col overflow-hidden">
//         <div className="bg-[#252526] px-4 py-2 text-xs font-mono text-gray-400 border-b border-gray-700">
//             state.json (Preview)
//         </div>
//         <pre className="p-4 text-xs font-mono text-green-400 overflow-auto flex-1">
//             {JSON.stringify(state, null, 2)}
//         </pre>
//     </div>
//     <button
//         onClick={() => onNext(state)}
//         disabled={!state.label || !state.nodeType}
//         className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg transition-all"
//     >
//         Next: Write Logic →
//     </button>
// </div>
//         </div >
//     );
// }