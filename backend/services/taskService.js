import AppError from '../utils/AppError.js';
import assignmentRepository from '../repositories/assignmentRepository.js';
import groupworkRepository from '../repositories/groupworkRepository.js';
import taskRepository from '../repositories/taskRepository.js';
import { ensureGroupLeader, ensureGroupMember } from './permissionService.js';

const allowedStatuses = ['Pending', 'In Progress', 'Review', 'Completed'];
const allowedPriorities = ['Low', 'Medium', 'High'];

function validateTask(data, partial = false) {
  if (!partial && !data.assignment_id) {
    throw new AppError('assignment_id is required', 400);
  }

  if (data.status && !allowedStatuses.includes(data.status)) {
    throw new AppError(`Invalid task status. Use: ${allowedStatuses.join(', ')}`, 400);
  }

  if (data.priority && !allowedPriorities.includes(data.priority)) {
    throw new AppError(`Invalid priority. Use: ${allowedPriorities.join(', ')}`, 400);
  }
}

async function ensureAssignment(assignmentId) {
  const assignment = await assignmentRepository.findById(assignmentId);

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  return assignment;
}

async function ensureAssigneeIsMember(assignedUserId, groupworkId) {
  if (!assignedUserId) {
    return;
  }

  const membership = await groupworkRepository.findMembership(assignedUserId, groupworkId);

  if (!membership) {
    throw new AppError('Assigned user must be an active group member', 400);
  }
}

async function create(user, data) {
  validateTask(data);
  const assignment = await ensureAssignment(data.assignment_id);
  await ensureGroupLeader(user, assignment.groupwork_id);
  await ensureAssigneeIsMember(data.assigned_user_id, assignment.groupwork_id);

  return taskRepository.create(data);
}

async function getAll(user) {
  return taskRepository.findAllForUser(user);
}

async function getById(user, taskId) {
  const task = await taskRepository.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await ensureGroupMember(user, task.groupwork_id);
  return task;
}

async function update(user, taskId, data) {
  validateTask(data, true);
  const task = await taskRepository.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await ensureGroupLeader(user, task.groupwork_id);

  if (data.assignment_id && Number(data.assignment_id) !== Number(task.assignment_id)) {
    const nextAssignment = await ensureAssignment(data.assignment_id);
    await ensureGroupLeader(user, nextAssignment.groupwork_id);
    await ensureAssigneeIsMember(data.assigned_user_id || task.assigned_user_id, nextAssignment.groupwork_id);
  } else {
    await ensureAssigneeIsMember(data.assigned_user_id, task.groupwork_id);
  }

  return taskRepository.update(taskId, data);
}

async function updateStatus(user, taskId, status) {
  if (!allowedStatuses.includes(status)) {
    throw new AppError(`Invalid task status. Use: ${allowedStatuses.join(', ')}`, 400);
  }

  const task = await taskRepository.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const canLead = user.role === 'Admin' || await groupworkRepository.isLeader(user.user_id, task.groupwork_id);
  const isAssignedUser = task.assigned_user_id === user.user_id;

  if (!canLead && !isAssignedUser) {
    throw new AppError('Only the assigned user, group leader, or admin can update task status', 403);
  }

  return taskRepository.updateStatus(taskId, status);
}

async function remove(user, taskId) {
  const task = await taskRepository.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await ensureGroupLeader(user, task.groupwork_id);
  await taskRepository.remove(taskId);
  return true;
}

async function getByAssignment(user, assignmentId) {
  const assignment = await ensureAssignment(assignmentId);
  await ensureGroupMember(user, assignment.groupwork_id);
  return taskRepository.findByAssignmentId(assignmentId);
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
