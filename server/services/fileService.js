const pool = require('../utils/db');

// Save file metadata to DB after cloudinary upload
const saveFile = async (orgId, uploadedBy, fileName, fileSize, fileType, fileUrl, publicId, messageId = null) => {
    const result = await pool.query(
        `insert into files (org_id, uploaded_by, file_name, file_size, file_type, file_url, message_id)
        values ($1, $2, $3, $4, $5, $6, $7)
        returning *`,
        [orgId, uploadedBy, fileName, fileSize, fileType, fileUrl, messageId]
    );
    return result.rows[0];
};

// Get all files for an org with uploader details
const getOrgFiles = async (orgId, search = '', limit = 20, offset = 0) => {
  let query;
  let params;

  if (search.trim()) {
    query = `
      SELECT f.*,
             u.name as uploader_name,
             u.avatar_url as uploader_avatar
      FROM files f
      JOIN users u ON f.uploaded_by = u.id
      WHERE f.org_id = $1
        AND f.file_name ILIKE $2
      ORDER BY f.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    params = [orgId, `%${search}%`, limit, offset];
  } else {
    query = `
      SELECT f.*,
             u.name as uploader_name,
             u.avatar_url as uploader_avatar
      FROM files f
      JOIN users u ON f.uploaded_by = u.id
      WHERE f.org_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    params = [orgId, limit, offset];
  }

  const result = await pool.query(query, params);
  return result.rows;
};

// Get a single file by ID
const getFileById = async (fileId) => {
    const result = await pool.query(
        `select f.*,
            u.name as uploaded_name,
            u.avatar_url as uploader_avatar
        from files f
        join users u on f.uploaded_by = u.id
        where f.id = $1`,
        [fileId]
    );
    return result.rows[0] || null;
};

// Delete a file record from DB returns deleted row or null if not found
const deleteFileById = async (fileId) => {
    const result = await pool.query(
        `delete from files where id = $1 returning *`,
        [fileId]
    );
    return result.rows[0] || null;
};

// Get total file count for an org
const getOrgFilesCount = async (orgId, search = '') => {
  let query;
  let params;

  if (search.trim()) {
    query = `SELECT COUNT(*) as count FROM files WHERE org_id = $1 AND file_name ILIKE $2`;
    params = [orgId, `%${search}%`];
  } else {
    query = `SELECT COUNT(*) as count FROM files WHERE org_id = $1`;
    params = [orgId];
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count);
};

// Get files attached to a specific message
const getMessageFiles = async (messageId) => {
    const result = await pool.query(
        `select * from files where message_id = $1`,
        [messageId]
    );
    return result.rows[0];
};

module.exports = {
    saveFile,
    getOrgFiles,
    getFileById,
    deleteFileById,
    getOrgFilesCount,
    getMessageFiles,
};