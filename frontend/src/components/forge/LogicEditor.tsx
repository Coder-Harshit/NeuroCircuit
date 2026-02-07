import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type { ForgeState } from "./types";

interface Props {
  manifest: ForgeState;
  onNext: (code: string) => void;
  onBack: () => void;
}

const IMPORT_MAP: Record<string, string> = {
  "opencv-python-headless": "import cv2 as cv",
  "opencv-python": "import cv2 as cv",
  "pandas": "import pandas as pd",
  "numpy": "import numpy as np",
  "scikit-learn": "import sklearn",
  "requests": "import requests",
  "matplotlib": "import matplotlib.pyplot as plt"
};

const generateTemplate = (manifest: ForgeState) => {
  // PascalCase for Class Name (e.g., "blurImage" -> "BlurImageNodeData")
  const className = `${manifest.nodeType.charAt(0).toUpperCase() + manifest.nodeType.slice(1)}NodeData`;
  // Let's force snake_case for function if nodeType is camelCase
  const snakeFuncName = manifest.nodeType.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`) + "_node";

  // 1. Generate Dynamic Imports
  const dynamicImports = manifest.dependencies
    .map(dep => IMPORT_MAP[dep] || `# import ${dep}  <-- Check import name`)
    .join("\n");

  return `${dynamicImports ? dynamicImports + "\n" : ""}from typing import Any, List
from app.classes import ${className}

# --- Plugin Metadata ---
node_info = {
    "nodeType": "${manifest.nodeType}",
    "function": "${snakeFuncName}",
    "inDegree": ${manifest.inputs.length},
}
# -----------------------

# TODO: Add this class to backend/app/classes.py (Pydantic Model)
# class ${className}(BaseModel):
#     label: str
${manifest.params.map(p => `#     ${p.name}: ${p.type === 'number' ? 'float' : 'str'} = ${JSON.stringify(p.default)}`).join("\n")}


def ${snakeFuncName}(data: ${className}, inputs: list[Any]) -> Any:
    """
    ${manifest.description || "Process inputs and return result."}
    
    Args:
        data: Parameters (${manifest.params.map(p => p.name).join(", ")})
        inputs: List of [${manifest.inputs.map(i => i.name).join(", ")}]
    """
    
    # 1. Validate Inputs
    if len(inputs) < ${manifest.inputs.length}:
        raise ValueError("Missing inputs for ${manifest.label}")

    # 2. Extract Inputs
    ${manifest.inputs.map((inp, i) => `${inp.name} = inputs[${i}]`).join("\n    ")}
    
    # 3. Your Logic Here...
    # Example: result = ...
    result = None

    return result  # Replace with actual processing logic
`;
};

export default function LogicEditor({ manifest, onNext, onBack }: Props) {
  const [code, setCode] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWarning, setIsWarning] = useState<boolean>(false);

  // Load template on first mount
  useEffect(() => {
    if (!code) {
      setCode(generateTemplate(manifest));
    }
  }, [manifest, code]);


  const handleAnalyse = async () => {
    setIsAnalyzing(true);
    setError(null);
    setIsWarning(false);

    try {
      const resp = await fetch("http://127.0.0.1:8000/api/forge/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const result = await resp.json();
      if (!resp.ok) {
        throw new Error(result.detail || "Analysis failed");
      }

      if (result.status === "error" || result.status === "fail") {
        setError(`❌ ${result.message}`);
      } else if (result.status === "warning") {
        // Show warnings but allow proceeding if user insists (optional logic)
        // For now, let's treat warnings as non-blocking but visible
        const uniqueIssues = [...new Set(result.issues as string[])];
        const maxIssuesToShow = 3;
        const issueCount = uniqueIssues.length;
        const visibleIssues = uniqueIssues.slice(0, maxIssuesToShow);
        const issueText = visibleIssues.map((issue: string) => `• ${issue}`).join("\n");

        setError(`⚠️ Found ${issueCount} issue(s):\n${issueText}${issueCount > maxIssuesToShow ? `\n... and ${issueCount - maxIssuesToShow} more` : ""}`);
        setIsWarning(true);
      } else {
        // Success
        console.log(`Complexity Score: ${result.complexity}`);
        onNext(code);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to backend analysis service.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDismissWarning = () => {
    setIsWarning(false);
    onNext(code);
  }


  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42]">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-mono text-sm">
            backend/plugins/{manifest.category}_{manifest.nodeType}.py
          </span>
          <span className="text-xs text-gray-500">(Draft)</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="px-3 py-1 text-sm hover:bg-[#3e3e42] rounded transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleAnalyse}
            disabled={isAnalyzing}
            className={`
                    px-4 py-1 text-sm font-medium rounded transition-all flex items-center gap-2
                    ${isAnalyzing ? 'bg-yellow-600 cursor-wait' : 'bg-green-600 hover:bg-green-700'}
                    text-white
                `}
          >
            {isAnalyzing ? "Analyzing..." : "Analyse & Continue"}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
        />

        {/* Error Toast */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-100 p-3 rounded border border-red-700 shadow-xl flex justify-between items-center backdrop-blur-sm animate-in slide-in-from-bottom-2">
            <pre className="m-0 p-0">
              <span>🚫 {error}</span>
            </pre>
            {isWarning ? (
              <button onClick={handleDismissWarning} className="hover:text-white">Proceed Anyway</button>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </div>
  );
}