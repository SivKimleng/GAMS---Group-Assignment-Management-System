import submissionService from '../services/submissionService.js';
import { sendSuccess } from '../utils/responses.js';

async function get(req, res, next) { try { sendSuccess(res, 200, 'Submission fetched successfully', await submissionService.get(req.user, req.params.taskId)); } catch (error) { next(error); } }
async function submit(req, res, next) { try { sendSuccess(res, 200, 'Assignment submitted successfully', await submissionService.submit(req.user, req.params.taskId, req.body)); } catch (error) { next(error); } }
async function unsubmit(req, res, next) { try { sendSuccess(res, 200, 'Assignment un-submitted successfully', await submissionService.unsubmit(req.user, req.params.taskId)); } catch (error) { next(error); } }
export default { get, submit, unsubmit };
