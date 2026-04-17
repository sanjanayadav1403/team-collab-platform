import { useState, useRef } from 'react';
import api from '../../api/axios';
import useOrgStore from '../../store/orgStore';
import {
    File,
    Image,
    FileText,
    FileSpreadsheet,
    FileArchive,
    FileType,
    X,
    Cloud,
} from "lucide-react";

/**
 * FileUploadZone
 * Drag & drop or click to upload files.
 */
const FileUploadZone = ({ onUploadSuccess, onClose }) => {
    const { currentOrg } = useOrgStore();
    const [dragOver, setDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({});
    const [errors, setErrors] = useState([]);
    const inputRef = useRef(null);

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    const addFiles = (files) => {
        const newErrors = [];
        const valid = files.filter((f) => {
            if (f.size > MAX_SIZE) {
                newErrors.push(`${f.name} is too large (max 10MB).`);
                return false;
            }
            return true;
        });
        setErrors(newErrors);
        setSelectedFiles((prev) => [...prev, ...valid]);
    };

    const removeFile = (index) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (type) => {
        if (!type) return <File />;

        if (type.startsWith("image/")) return <Image />;

        if (type === "application/pdf") return <FileText />;

        if (type.includes("word")) return <FileText />;

        if (
            type.includes("excel") ||
            type.includes("sheet") ||
            type === "text/csv"
        )
            return <FileSpreadsheet />;

        if (type.includes("zip") || type.includes("rar"))
            return <FileArchive />;

        return <File />;
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setErrors([]);
        const uploaded = [];
        const newErrors = [];

        for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('orgId', currentOrg.id);

            try {
                setProgress((prev) => ({ ...prev, [file.name]: 0 }));

                const res = await api.post('/files/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (e) => {
                        const pct = Math.round((e.loaded * 100) / e.total);
                        setProgress((prev) => ({ ...prev, [file.name]: pct }));
                    },
                });

                uploaded.push(res.data.data.file);
                setProgress((prev) => ({ ...prev, [file.name]: 100 }));
            } catch (err) {
                newErrors.push(`Failed to upload ${file.name}: ${err.response?.data?.message || 'Unknown error'}`);
            }
        }

        setUploading(false);
        setErrors(newErrors);

        if (uploaded.length > 0) {
            onUploadSuccess(uploaded);
            if (newErrors.length === 0) onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-300 border border-gray-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-800">Upload Files</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition">
                        <X />
                    </button>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        {errors.map((e, i) => (
                            <p key={i} className="text-red-400 text-xs">{e}</p>
                        ))}
                    </div>
                )}

                {/* Drop zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${dragOver
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-gray-400 hover:border-gray-500 hover:bg-gray-400/50'
                        }`}
                >
                    <div className="text-3xl mb-2 flex justify-center"><Cloud color='blue' size={30}/></div>
                    <p className="text-gray-600 font-medium text-sm">
                        Drop files here or <span className="text-indigo-400">browse</span>
                    </p>
                    <p className="text-gray-600 text-xs mt-1">Max 10MB per file</p>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>

                {/* Selected files list */}
                {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 bg-gray-400 rounded-lg px-3 py-2">
                                <span className="text-lg shrink-0">{getFileIcon(file.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700 truncate">{file.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                                        {/* Progress bar */}
                                        {progress[file.name] !== undefined && (
                                            <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full transition-all"
                                                    style={{ width: `${progress[file.name]}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!uploading && (
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="text-gray-600 hover:text-red-400 transition shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-5">
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-600 hover:bg-gray-800 hover:text-white transition text-sm font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploading}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium transition text-sm flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Uploading...
                            </>
                        ) : (
                            `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUploadZone;