
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // JWT specific errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired. Please refresh your session.',
    });
  }

  // PostgreSQL unique constraint violation (e.g. duplicate email)
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
      detail: err.detail || null,
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.',
    });
  }

  // Custom app errors thrown with a statusCode property
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Default: 500 Internal Server Error
  return res.status(500).json({
    success: false,
    message: 'Internal server error. Please try again later.',
  });
};

/**
 * Helper to create custom errors with a status code
 * Usage: throw createError(403, 'You are not allowed to do this')
 */
const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { errorHandler, createError };