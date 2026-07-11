import express from 'express';
import taskController from '../controllers/taskController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequired } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/personal', validateRequired(['assignment_id', 'task_name', 'due_date']), taskController.createPersonal);
router.post('/', validateRequired(['assignment_id', 'task_name', 'due_date']), taskController.create);
router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.put('/:id', taskController.update);
router.patch('/:id/status', validateRequired(['status']), taskController.updateStatus);
router.delete('/:id', taskController.remove);

export default router;
