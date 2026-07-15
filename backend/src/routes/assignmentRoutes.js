import express from 'express';
import assignmentController from '../controllers/assignmentController.js';
import progressController from '../controllers/progressController.js';
import taskController from '../controllers/taskController.js';
import assignmentFileController from '../controllers/assignmentFileController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequired } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validateRequired(['groupwork_id', 'assignment_name', 'deadline']), assignmentController.create);
router.get('/', assignmentController.getAll);
router.get('/:assignmentId/tasks', taskController.getByAssignment);
router.get('/:assignmentId/materials', assignmentFileController.getAll);
router.post('/:assignmentId/materials', assignmentFileController.create);
router.get('/:assignmentId/progress', progressController.getByAssignment);
router.get('/:id', assignmentController.getById);
router.put('/:id', assignmentController.update);
router.delete('/:id', assignmentController.remove);

export default router;
