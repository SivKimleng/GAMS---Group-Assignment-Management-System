import bcrypt from 'bcrypt';
import AppError from '../utils/AppError.js';
import userRepository from '../repositories/userRepository.js';

const allowedRoles = ['Student', 'Instructor', 'Admin'];

async function getAll() {
  return userRepository.findAll();
}

async function getById(requestUser, userId) {
  if (requestUser && requestUser.role !== 'Admin' && requestUser.user_id !== Number(userId)) {
    throw new AppError('You can only view your own profile', 403);
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

async function update(requestUser, userId, data) {
  if (requestUser.role !== 'Admin' && requestUser.user_id !== Number(userId)) {
    throw new AppError('You can only update your own profile', 403);
  }

  await getById(requestUser, userId);

  const changes = {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email?.toLowerCase().trim()
  };

  if (requestUser.role === 'Admin' && allowedRoles.includes(data.role)) {
    changes.role = data.role;
  }

  if (data.password) {
    changes.password_hash = await bcrypt.hash(data.password, 10);
  }

  return userRepository.update(userId, changes);
}

async function remove(userId) {
  const deleted = await userRepository.remove(userId);

  if (!deleted) {
    throw new AppError('User not found', 404);
  }

  return true;
}

export default {
  getAll,
  getById,
  update,
  remove
};
