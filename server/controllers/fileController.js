const { cloudinary } = require('../middleware/upload');
const {
  saveFile,
  getOrgFiles,
  getFileById,
  deleteFileById,
  getOrgFilesCount,
} = require('../services/fileService');
const { getMemberRole } = require('../services/orgService');
const { createError } = require('../middleware/errorHandler');

/**
 * POST /api/files/upload
 * Upload a file to Cloudinary and save metadata to DB.
 * Requires: orgId in body, file in multipart form
 */
const uploadFile = async (req, res, next) => {
  try {
    // Multer already uploaded to Cloudinary at this point
    if (!req.file) {
      return next(createError(400, 'No file provided.'));
    }

    const { orgId, messageId } = req.body;

    if (!orgId) {
      return next(createError(400, 'orgId is required.'));
    }

    // Verify user is org member
    const role = await getMemberRole(orgId, req.user.id);
    if (!role) {
      return next(createError(403, 'You are not a member of this organisation.'));
    }

    const { originalname, mimetype, size, path: fileUrl, filename } = req.file;

    // Save metadata to DB
    const file = await saveFile(
      orgId,
      req.user.id,
      originalname,
      size,
      mimetype,
      fileUrl,
      filename, // Cloudinary public_id
      messageId || null
    );

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      data: { file },
    });
  } catch (err) {
    console.error('uploadFile error:', err.message);
    next(err);
  }
};

/**
 * GET /api/files/org/:orgId
 * Get all files for an org. Supports search + pagination.
 * Query: ?search=&page=1&limit=20&type=image|document|pdf
 */
const getOrgFilesHandler = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Verify user is org member
    const role = await getMemberRole(orgId, req.user.id);
    if (!role) {
      return next(createError(403, 'You are not a member of this organisation.'));
    }

    const [files, total] = await Promise.all([
      getOrgFiles(orgId, search, limit, offset),
      getOrgFilesCount(orgId, search),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        files,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + files.length < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/files/:fileId
 * Get a single file by ID.
 */
const getFileByIdHandler = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const file = await getFileById(fileId);

    if (!file) {
      return next(createError(404, 'File not found.'));
    }

    return res.status(200).json({
      success: true,
      data: { file },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/files/:fileId
 * Delete a file from Cloudinary and DB.
 * Only the uploader can delete their file.
 */
const deleteFileHandler = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    const file = await getFileById(fileId);
    if (!file) {
      return next(createError(404, 'File not found.'));
    }

    // Only uploader can delete
    if (file.uploaded_by !== req.user.id) {
      return next(createError(403, 'You can only delete your own files.'));
    }

    // Delete from Cloudinary
    try {
      const isImage = file.file_type?.startsWith('image/');
      await cloudinary.uploader.destroy(
        file.file_name,
        { resource_type: isImage ? 'image' : 'raw' }
      );
    } catch (cloudErr) {
      console.warn('Cloudinary delete warning:', cloudErr.message);
      // Continue even if Cloudinary delete fails
    }

    // Delete from DB
    await deleteFileById(fileId);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadFile,
  getOrgFilesHandler,
  getFileByIdHandler,
  deleteFileHandler,
};