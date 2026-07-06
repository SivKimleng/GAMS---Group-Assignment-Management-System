import express from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequired } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/register', validateRequired(['first_name', 'last_name', 'email', 'password']), authController.register);
router.post('/login', validateRequired(['email', 'password']), authController.login);
router.get('/me', authMiddleware, authController.me);

export default router;
