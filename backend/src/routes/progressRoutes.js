import express from 'express';
import progressController from '../controllers/progressController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/assignments/:assignmentId', progressController.getByAssignment);

export default router;
