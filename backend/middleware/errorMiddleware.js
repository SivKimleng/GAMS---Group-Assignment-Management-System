import AppError from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}

export function errorMiddleware(error, req, res, next) {
  if (error.code === 'ER_DUP_ENTRY') {
    error.statusCode = 409;
    error.message = 'Duplicate value already exists';
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
}
