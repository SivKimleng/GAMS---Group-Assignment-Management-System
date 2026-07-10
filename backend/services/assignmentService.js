import AppError from '../utils/AppError.js';
import assignmentRepository from '../repositories/assignmentRepository.js';
import { ensureGroupExists, ensureGroupLeader, ensureGroupMember } from './permissionService.js';

const allowedStatuses = ['Pending', 'In Progress', 'Review', 'Completed'];
const allowedPriorities = ['Low', 'Medium', 'High'];

function validateAssignment(data, partial = false) {
  if (!partial && !data.groupwork_id) {
    throw new AppError('groupwork_id is required', 400);
  }

  if (data.status && !allowedStatuses.includes(data.status)) {
    throw new AppError(`Invalid assignment status. Use: ${allowedStatuses.join(', ')}`, 400);
  }

  if (data.priority && !allowedPriorities.includes(data.priority)) {
    throw new AppError(`Invalid priority. Use: ${allowedPriorities.join(', ')}`, 400);
  }
}

async function create(user, data) {
  validateAssignment(data);
  await ensureGroupExists(data.groupwork_id);
  await ensureGroupLeader(user, data.groupwork_id);

  return assignmentRepository.create({
    ...data,
    created_by_user_id: user.user_id
  });
}

async function getAll(user) {
  return assignmentRepository.findAllForUser(user);
}

async function getById(user, assignmentId) {
  const assignment = await assignmentRepository.findById(assignmentId);

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  await ensureGroupMember(user, assignment.groupwork_id);
  return assignment;
}

async function update(user, assignmentId, data) {
  validateAssignment(data, true);
  const assignment = await assignmentRepository.findById(assignmentId);

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  await ensureGroupLeader(user, assignment.groupwork_id);

  if (data.groupwork_id && Number(data.groupwork_id) !== Number(assignment.groupwork_id)) {
    await ensureGroupExists(data.groupwork_id);
    await ensureGroupLeader(user, data.groupwork_id);
  }

  return assignmentRepository.update(assignmentId, data);
}

async function remove(user, assignmentId) {
  const assignment = await assignmentRepository.findById(assignmentId);

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  await ensureGroupLeader(user, assignment.groupwork_id);
  await assignmentRepository.remove(assignmentId);
  return true;
}

async function getByGroupwork(user, groupworkId) {
  await ensureGroupExists(groupworkId);
  await ensureGroupMember(user, groupworkId);
  return assignmentRepository.findByGroupworkId(groupworkId);
}

export default {
  create,
  getAll,
  getById,
  update,
  remove,
  getByGroupwork
};
