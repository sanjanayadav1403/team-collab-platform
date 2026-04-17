import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Search, Upload } from 'lucide-react';
import api from '../api/axios';
import useOrgStore from '../store/orgStore';
import FileCard from '../components/files/FileCard';
import FilePreviewModal from '../components/files/FilePreviewModal';
import FileUploadZone from '../components/files/FileUploadZone';

const FilesPage = () => {
    const navigate = useNavigate();
    const { currentOrg } = useOrgStore();
    const [showUpload, setShowUpload] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [selectedFile, setSelectedFile] = useState(null);

    const filters = [
        { key: 'all', label: 'All Files' },
        { key: 'image', label: 'Images' },
        { key: 'pdf', label: 'PDFs' },
        { key: 'document', label: 'Documents' },
        { key: 'other', label: 'Other' },
    ];

    // Fetch files
    const fetchFiles = async (page = 1) => {
        if (!currentOrg) return;
        setLoading(true);
        try {
            const res = await api.get(`/files/org/${currentOrg.id}`, {
                params: { search, page, limit: 20 },
            });
            setFiles(res.data.data.files);
            setPagination(res.data.data.pagination);
        } catch (err) {
            console.error('Failed to fetch files:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentOrg) { navigate('/dashboard'); return; }
        fetchFiles();
    }, [currentOrg?.id]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => fetchFiles(1), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Filter files by type on frontend
    const filteredFiles = files.filter((file) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'image') return file.file_type?.startsWith('image/');
        if (activeFilter === 'pdf') return file.file_type === 'application/pdf';
        if (activeFilter === 'document') return (
            file.file_type?.includes('word') ||
            file.file_type?.includes('document') ||
            file.file_type?.includes('excel') ||
            file.file_type?.includes('sheet') ||
            file.file_type === 'text/plain' ||
            file.file_type === 'text/csv'
        );
        if (activeFilter === 'other') return (
            !file.file_type?.startsWith('image/') &&
            file.file_type !== 'application/pdf' &&
            !file.file_type?.includes('word') &&
            !file.file_type?.includes('document') &&
            !file.file_type?.includes('excel') &&
            !file.file_type?.includes('sheet')
        );
        return true;
    });

    // Handle upload success
    const handleUploadSuccess = (newFiles) => {
        setFiles((prev) => [...newFiles, ...prev]);
    };

    // Handle delete
    const handleDelete = async (file) => {
        if (!confirm(`Delete "${file.file_name}"? This cannot be undone.`)) return;
        setDeleting(file.id);
        try {
            await api.delete(`/files/${file.id}`);
            setFiles((prev) => prev.filter((f) => f.id !== file.id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete file.');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col">
            <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 bg-gray-300">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-800 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition"
                    >
                        <ArrowLeft size={16} />
                        Dashboard
                    </button>
                    <span className="text-gray-700">/</span>
                    <h1 className="text-gray-600 font-semibold text-sm">Files</h1>
                    {pagination.total > 0 && (
                        <span className="text-xs text-gray-600">{pagination.total} files</span>
                    )}
                </div>

                {/* Upload Button */}
                <button
                    onClick={() => setShowUpload(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition px-4 py-2 flex items-center gap-2"
                >
                    <Upload size={20} />
                    Upload
                </button>
            </div>

            {/* Toolbar */}
            <div className="border-b border-gray-200 px-4 py-2.5 flex items-center justify-between bg-gray-500/50">
                <div className="flex items-center gap-1">
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setActiveFilter(f.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeFilter === f.key
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-700 hover:text-gray-200 hover:bg-indigo-600/20'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 focus-within:border-indigo-500 transition">
                    <Search color="white" size={14} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search files..."
                        className="bg-transparent text-sm text-white placeholder-gray-200 focus:outline-none w-40"
                    />
                </div>
            </div>

            {/* Files Grid */}
            <div className="flex-1 p-4">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
                                <div className="h-32 bg-gray-800" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-gray-800 rounded w-3/4" />
                                    <div className="h-2 bg-gray-800 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center flex flex-col items-center justify-center">
                            <div className="text-5xl mb-4"><FileText color="orange" size={36} /></div>
                            <p className="text-gray-400 font-medium">
                                {search ? 'No files match your search' : 'No files uploaded yet'}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                                {!search && 'Click Upload to share files with your team'}
                            </p>
                            {!search && (
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
                                >
                                    Upload Files
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredFiles.map((file) => (
                            <FileCard
                                key={file.id}
                                file={file}
                                onClick={setSelectedFile}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedFile && (
                <FilePreviewModal
                    file={selectedFile}
                    onClose={() => setSelectedFile(null)}
                />
            )}
            {showUpload && (
                <FileUploadZone
                    onUploadSuccess={handleUploadSuccess}
                    onClose={() => setShowUpload(false)}
                />
            )}
        </div>
    );
}

export default FilesPage;