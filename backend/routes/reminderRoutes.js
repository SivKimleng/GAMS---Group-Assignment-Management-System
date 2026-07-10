import express from 'express';
import reminderController from '../controllers/reminderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequired } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', reminderController.getAll);
router.post('/', validateRequired(['reminder_message', 'reminder_date']), reminderController.create);
router.patch('/:id/read', reminderController.markRead);
router.delete('/:id', reminderController.remove);

export default router;
