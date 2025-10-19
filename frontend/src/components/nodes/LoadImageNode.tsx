import { Handle, Position } from '@xyflow/react';
import { useState, useRef, useEffect, type ChangeEvent } from 'react';
// Import the new type we will create in the next step
import type { LoadImageNodeProps } from '../../nodeTypes';

// --- Helper Components for UI states ---
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const LoadingSpinner = () => <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>;
const ErrorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-danger-text)]"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
// ------------------------------------

function bytesToSize(bytes = 0) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function LoadImageNode({ id, data }: LoadImageNodeProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [localFile, setLocalFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const clearFile = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setLocalFile(null);
        setPreviewUrl(null);
        setUploadError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        data.onChange(id, { filePath: "", file: null });
    };

    const handleFileSelect = async (file: File | null) => {
        if (!file) return;

        setUploadError(null);
        setLocalFile(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (file.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/files/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                // Use server's error message if available, otherwise default
                throw new Error(result.detail || `Upload failed with status: ${response.status}`);
            }

            if (result.filePath) {
                data.onChange(id, { filePath: result.filePath, file: null });
            } else {
                throw new Error(result.message || 'Server did not return a file path.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setUploadError(errorMessage);
            data.onChange(id, { filePath: "", file: null });
        } finally {
            setIsUploading(false);
        }
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        handleFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0] || null;
        handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const displayName = localFile?.name ?? data.filePath?.split(/[\\/]/).pop() ?? '';
    const isError = data.isError || !!uploadError;

    return (
        <div className={`
      w-[300px] rounded-lg shadow-md bg-[var(--color-surface-2)] text-[var(--color-text-1)]
      border ${isError ? 'border-[var(--color-danger-border)] shadow-lg shadow-red-500/20' : 'border-[var(--color-border-1)]'}
    `}>
            <div className="p-2 border-b border-[var(--color-border-1)] bg-[var(--color-node-header)] rounded-t-lg">
                <p className="font-bold text-[var(--color-node-header-text)]">{data.label}</p>
            </div>
            <div className="p-4 space-y-2">
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="nodrag w-full p-2 border-2 border-dashed rounded-md bg-[var(--color-surface-3)] border-[var(--color-border-2)] text-[var(--color-text-1)] cursor-pointer"
                    role="button"
                    aria-label="File drop zone"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    <input
                        id={`file-${id}`}
                        ref={fileInputRef}
                        type="file"
                        onChange={handleInputChange}
                        className="hidden"
                        accept={data.accept ?? '*/*'}
                        disabled={isUploading}
                    />

                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                        {isUploading ? <LoadingSpinner /> : (uploadError ? <ErrorIcon /> : <UploadIcon />)}
                        <div className="text-center text-sm text-[var(--color-text-2)]">
                            {isUploading ? "Uploading..." : (uploadError ? "Upload Failed" : (displayName ? "Replace File" : "Click or drag file here"))}
                        </div>
                        {uploadError && <p className="text-xs text-center text-[var(--color-danger-text)] max-w-full px-2">{uploadError}</p>}
                    </div>

                    {previewUrl && !uploadError && <img src={previewUrl} alt="preview" className="max-h-28 object-contain rounded my-2 mx-auto" />}

                    {displayName && (
                        <div className="w-full flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[var(--color-border-2)] text-[var(--color-text-1)]">
                            <span className="truncate text-sm font-medium" title={displayName}>{displayName}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-[var(--color-text-2)]">{localFile ? bytesToSize(localFile.size) : ''}</span>
                                <button
                                    type="button"
                                    onClick={clearFile}
                                    className="p-1 text-xs rounded-full bg-[var(--color-surface-3)] border border-[var(--color-border-2)] leading-none hover:bg-[var(--color-danger-surface)]"
                                    aria-label="Clear file"
                                >
                                    &#x2715;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Handle type="source" position={Position.Right} className="!bg-[var(--color-accent)]" />
        </div>
    );
}

export default LoadImageNode;