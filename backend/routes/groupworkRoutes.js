import express from 'express';
import groupworkController from '../controllers/groupworkController.js';
import assignmentController from '../controllers/assignmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateRequired } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', validateRequired(['groupwork_name', 'subject']), groupworkController.create);
router.get('/', groupworkController.getAll);
router.get('/:id', groupworkController.getById);
router.put('/:id', groupworkController.update);
router.delete('/:id', groupworkController.remove);
router.post('/:id/join', groupworkController.join);
router.get('/:id/members', groupworkController.getMembers);
router.get('/:groupworkId/assignments', assignmentController.getByGroupwork);

export default router;
