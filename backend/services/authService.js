import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import userRepository from '../repositories/userRepository.js';

const allowedRoles = ['Student', 'Instructor', 'Admin'];

function buildToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function register(data) {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }

  const email = data.email.toLowerCase().trim();
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const role = allowedRoles.includes(data.role) ? data.role : 'Student';
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await userRepository.create({
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
    email,
    password_hash: passwordHash,
    role
  });

  return {
    token: buildToken(user),
    user
  };
}

async function login(email, password) {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500);
  }

  const userWithPassword = await userRepository.findByEmail(email.toLowerCase().trim());

  if (!userWithPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, userWithPassword.password_hash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const { password_hash, ...user } = userWithPassword;

  return {
    token: buildToken(user),
    user
  };
}

async function me(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

export default {
  register,
  login,
  me
};
