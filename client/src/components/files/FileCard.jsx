import useAuthStore from '../../store/authStore';

/**
 * FileCard
 * Single file card in the files grid.
 */
const FileCard = ({ file, onClick, onDelete }) => {
  const { user } = useAuthStore();
  const isOwner = file.uploaded_by === user?.id;

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  // File type icon + color
  const getFileIcon = (type) => {
    if (!type) return { icon: '📄', color: 'bg-gray-800 text-gray-400' };
    if (type.startsWith('image/')) return { icon: '🖼️', color: 'bg-blue-500/10 text-blue-400' };
    if (type === 'application/pdf') return { icon: '📕', color: 'bg-red-500/10 text-red-400' };
    if (type.includes('word') || type.includes('document')) return { icon: '📝', color: 'bg-blue-500/10 text-blue-400' };
    if (type.includes('excel') || type.includes('sheet') || type === 'text/csv') return { icon: '📊', color: 'bg-green-500/10 text-green-400' };
    if (type.includes('presentation') || type.includes('powerpoint')) return { icon: '📊', color: 'bg-orange-500/10 text-orange-400' };
    if (type.includes('zip') || type.includes('rar')) return { icon: '🗜️', color: 'bg-yellow-500/10 text-yellow-400' };
    return { icon: '📄', color: 'bg-gray-800 text-gray-400' };
  };

  const { icon, color } = getFileIcon(file.file_type);
  const isImage = file.file_type?.startsWith('image/');

  return (
    <div
      className="bg-gray-500 border border-gray-800 rounded-xl overflow-hidden hover:border-indigo-500/40 transition-all group cursor-pointer"
      onClick={() => onClick(file)}
    >
      {/* Thumbnail / Icon area */}
      <div className={`h-32 flex items-center justify-center ${isImage ? 'bg-gray-300' : color}`}>
        {isImage ? (
          <img
            src={file.file_url}
            alt={file.file_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="text-4xl">{icon}</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-200 truncate mb-1" title={file.file_name}>
          {file.file_name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-200">{formatSize(file.file_size)}</span>
          <span className="text-xs text-gray-200">{formatDate(file.created_at)}</span>
        </div>
        <p className="text-xs text-gray-200 mt-1 truncate">
          by {file.uploader_name}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Download */}
          <a
            href={file.file_url}
            target="_blank"
            rel="noopener noreferrer"
            download={file.file_name}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition text-xs font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>

          {/* Delete — only owner */}
          {isOwner && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(file); }}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Delete file"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileCard;