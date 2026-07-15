import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import userRepository from '../repositories/userRepository.js';

export default async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid Authorization header', 401);
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findById(decoded.user_id);

    if (!user) {
      throw new AppError('Authenticated user no longer exists', 401);
    }

    req.user = {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired token', 401));
      return;
    }

    next(error);
  }
}
