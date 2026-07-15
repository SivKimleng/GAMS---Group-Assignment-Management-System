import groupworkService from '../services/groupworkService.js';
import { sendSuccess } from '../utils/responses.js';

async function create(req, res, next) {
  try {
    const groupwork = await groupworkService.create(req.user, req.body);
    sendSuccess(res, 201, 'Groupwork created successfully', groupwork);
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    const groupworks = await groupworkService.getAll(req.user);
    sendSuccess(res, 200, 'Groupworks fetched successfully', groupworks);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const groupwork = await groupworkService.getById(req.user, req.params.id);
    sendSuccess(res, 200, 'Groupwork fetched successfully', groupwork);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const groupwork = await groupworkService.update(req.user, req.params.id, req.body);
    sendSuccess(res, 200, 'Groupwork updated successfully', groupwork);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await groupworkService.remove(req.user, req.params.id);
    sendSuccess(res, 200, 'Groupwork deleted successfully', null);
  } catch (error) {
    next(error);
  }
}

async function join(req, res, next) {
  try {
    const groupwork = await groupworkService.join(req.user, req.params.id, req.body);
    sendSuccess(res, 200, 'Joined groupwork successfully', groupwork);
  } catch (error) {
    next(error);
  }
}

async function getMembers(req, res, next) {
  try {
    const members = await groupworkService.getMembers(req.user, req.params.id);
    sendSuccess(res, 200, 'Groupwork members fetched successfully', members);
  } catch (error) {
    next(error);
  }
}

async function removeMember(req, res, next) {
  try {
    await groupworkService.removeMember(req.user, req.params.id, req.params.userId);
    sendSuccess(res, 200, 'Group member removed successfully', null);
  } catch (error) {
    next(error);
  }
}

async function leave(req, res, next) {
  try {
    const result = await groupworkService.leave(req.user, req.params.id);
    sendSuccess(res, 200, result.deleted ? 'Group deleted successfully' : 'You left the group successfully', result);
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
  join,
  getMembers,
  removeMember,
  leave
};
