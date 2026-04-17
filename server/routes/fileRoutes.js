const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getOrgFilesHandler,
  getFileByIdHandler,
  deleteFileHandler,
} = require('../controllers/fileController');
const authenticate = require('../middleware/authenticate');
const { upload } = require('../middleware/upload');

/**
 * File Routes — mounted at /api/files
 *
 * POST   /api/files/upload          → upload file (multipart)
 * GET    /api/files/org/:orgId      → get org files
 * GET    /api/files/:fileId         → get single file
 * DELETE /api/files/:fileId         → delete file
 */

// upload.single('file') — expects field name 'file' in form-data
router.post('/upload', authenticate, upload.single('file'), uploadFile);
router.get('/org/:orgId', authenticate, getOrgFilesHandler);
router.get('/:fileId', authenticate, getFileByIdHandler);
router.delete('/:fileId', authenticate, deleteFileHandler);

module.exports = router;