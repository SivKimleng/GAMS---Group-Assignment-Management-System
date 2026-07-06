import taskService from '../services/taskService.js';
import { sendSuccess } from '../utils/responses.js';

async function create(req, res, next) {
  try {
    const task = await taskService.create(req.user, req.body);
    sendSuccess(res, 201, 'Task created successfully', task);
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const tasks = await taskService.getAll(req.user);
    sendSuccess(res, 200, 'Tasks fetched successfully', tasks);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const task = await taskService.getById(req.user, req.params.id);
    sendSuccess(res, 200, 'Task fetched successfully', task);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const task = await taskService.update(req.user, req.params.id, req.body);
    sendSuccess(res, 200, 'Task updated successfully', task);
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const task = await taskService.updateStatus(req.user, req.params.id, req.body.status);
    sendSuccess(res, 200, 'Task status updated successfully', task);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await taskService.remove(req.user, req.params.id);
    sendSuccess(res, 200, 'Task deleted successfully', null);
  } catch (error) {
    next(error);
  }
}

async function getByAssignment(req, res, next) {
  try {
    const tasks = await taskService.getByAssignment(req.user, req.params.assignmentId);
    sendSuccess(res, 200, 'Assignment tasks fetched successfully', tasks);
  } catch (error) {
    next(error);
  }
}

export default {
  create,
  getAll,
  getById,
  update,
  updateStatus,
  remove,
  getByAssignment
};
