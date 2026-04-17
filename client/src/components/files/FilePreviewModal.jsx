/**
 * FilePreviewModal
 * Preview images and PDFs inline. Others show download button.
 */
const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const isImage = file.file_type?.startsWith('image/');
  const isPdf = file.file_type === 'application/pdf';

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{file.file_name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatSize(file.file_size)} · Uploaded by {file.uploader_name} · {formatDate(file.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {/* Download button */}
            <a
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download={file.file_name}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-950 min-h-64">
          {isImage ? (
            <img
              src={file.file_url}
              alt={file.file_name}
              className="max-w-full max-h-full object-contain p-4"
            />
          ) : isPdf ? (
            <iframe
              src={file.file_url}
              title={file.file_name}
              className="w-full h-full min-h-96"
              style={{ border: 'none' }}
            />
          ) : (
            <div className="text-center p-10">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-400 font-medium mb-2">{file.file_name}</p>
              <p className="text-gray-600 text-sm mb-6">Preview not available for this file type.</p>
              <a
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download={file.file_name}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;