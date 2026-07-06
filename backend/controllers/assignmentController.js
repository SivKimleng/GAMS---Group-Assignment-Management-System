import assignmentService from '../services/assignmentService.js';
import { sendSuccess } from '../utils/responses.js';

async function create(req, res, next) {
  try {
    const assignment = await assignmentService.create(req.user, req.body);
    sendSuccess(res, 201, 'Assignment created successfully', assignment);
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const assignments = await assignmentService.getAll(req.user);
    sendSuccess(res, 200, 'Assignments fetched successfully', assignments);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const assignment = await assignmentService.getById(req.user, req.params.id);
    sendSuccess(res, 200, 'Assignment fetched successfully', assignment);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const assignment = await assignmentService.update(req.user, req.params.id, req.body);
    sendSuccess(res, 200, 'Assignment updated successfully', assignment);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await assignmentService.remove(req.user, req.params.id);
    sendSuccess(res, 200, 'Assignment deleted successfully', null);
  } catch (error) {
    next(error);
  }
}

async function getByGroupwork(req, res, next) {
  try {
    const assignments = await assignmentService.getByGroupwork(req.user, req.params.groupworkId);
    sendSuccess(res, 200, 'Groupwork assignments fetched successfully', assignments);
  } catch (error) {
    next(error);
  }
}

export default {
  create,
  getAll,
  getById,
  update,
  remove,
  getByGroupwork
};
