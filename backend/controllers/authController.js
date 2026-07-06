import authService from '../services/authService.js';
import { sendSuccess } from '../utils/responses.js';

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, 201, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.me(req.user.user_id);
    sendSuccess(res, 200, 'Authenticated user fetched successfully', user);
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  login,
  me
};
