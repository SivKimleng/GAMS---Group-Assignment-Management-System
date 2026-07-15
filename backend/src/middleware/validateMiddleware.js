import AppError from '../utils/AppError.js';

export function validateRequired(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));
      return;
    }

    next();
  };
}
