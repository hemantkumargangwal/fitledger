const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Internal server error';
  let fields = err.fields;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    code = 'RESOURCE_NOT_FOUND';
    message = 'Resource not found';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'resource';
    statusCode = 409;
    code = 'RESOURCE_CONFLICT';
    message = `${field} already exists`;
    fields = [{ field, message }];
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    fields = Object.entries(err.errors).map(([field, value]) => ({
      field,
      message: value.message,
    }));
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  }

  if (statusCode >= 500) {
    console.error(JSON.stringify({
      level: 'error',
      requestId: req.requestId,
      code,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }));
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(fields?.length ? { fields } : {}),
    },
    // Kept during the V1 migration so current client pages remain compatible.
    message,
    requestId: req.requestId,
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APPLICATION_ERROR', fields) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const notFoundHandler = (req, _res, next) => {
  next(new AppError(
    `Route ${req.method} ${req.originalUrl} was not found`,
    404,
    'ROUTE_NOT_FOUND'
  ));
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  notFoundHandler,
};
