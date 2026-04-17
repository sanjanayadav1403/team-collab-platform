const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');

        return {
            folder: 'teamcollab',
            resource_type: isImage ? 'image' : isVideo ? 'video' : 'raw',
            public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`,
            flags: isImage ? undefined : 'attachment'
        };
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Spreadsheets
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // Presentations
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Text
        'text/plain', 'text/csv',
        // Archives
        'application/zip', 'application/x-rar-compressed',
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed.`), false);
    }
};

// Multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});

module.exports = { upload, cloudinary };