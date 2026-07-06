import progressService from '../services/progressService.js';
import { sendSuccess } from '../utils/responses.js';

async function getByAssignment(req, res, next) {
  try {
    const progress = await progressService.getByAssignment(req.user, req.params.assignmentId);
    sendSuccess(res, 200, 'Assignment progress calculated successfully', progress);
  } catch (error) {
    next(error);
  }
}

export default {
  getByAssignment
};
