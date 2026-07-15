import userService from '../services/userService.js';
import { sendSuccess } from '../utils/responses.js';

async function getAll(req, res, next) {
  try {
    const users = await userService.getAll();
    sendSuccess(res, 200, 'Users fetched successfully', users);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const user = await userService.getById(req.params.id);
    sendSuccess(res, 200, 'User fetched successfully', user);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const user = await userService.update(req.user, req.params.id, req.body);
    sendSuccess(res, 200, 'User updated successfully', user);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await userService.remove(req.params.id);
    sendSuccess(res, 200, 'User deleted successfully', null);
  } catch (error) {
    next(error);
  }
}

export default {
  getAll,
  getById,
  update,
  remove
};
