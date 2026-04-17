const pool = require('../utils/db');

/**
 * Insert a new user into the users table.
 * Password must already be hashed before calling this.
 * Returns the created user row (without password_hash).
 */
const createUser = async (name, email, passwordHash) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, avatar_url, is_online, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
};

/**
 * Find a user by their email address.
 * Returns full row including password_hash (needed for bcrypt compare).
 * Returns null if not found.
 */
const findUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

/**
 * Find a user by their UUID.
 * Returns user without password_hash.
 * Returns null if not found.
 */
const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, avatar_url, is_online, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Update user's online status.
 * Called when user connects/disconnects via Socket.io (used later in Day 3).
 */
const updateOnlineStatus = async (userId, isOnline) => {
  await pool.query(
    'UPDATE users SET is_online = $1 WHERE id = $2',
    [isOnline, userId]
  );
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateOnlineStatus,
};