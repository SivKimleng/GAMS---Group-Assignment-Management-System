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

async function createPersonal(user, data) {
  validateTask(data);
  if (!(await taskRepository.supportsPrivateTasks())) {
    throw new AppError('Private tasks are not available until the database schema is updated', 503);
  }

  const assignment = await ensureAssignment(data.assignment_id);
  await ensureGroupMember(user, assignment.groupwork_id);

  return taskRepository.create({
    ...data,
    assigned_user_id: user.user_id,
    is_private: true
  });
}

async function getAll(user) {
  return taskRepository.findAllForUser(user);
}

async function getById(user, taskId) {
  const task = await taskRepository.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (task.is_private && Number(task.assigned_user_id) !== Number(user.user_id) && user.role !== 'Admin') {
    throw new AppError('This private task is only available to its owner', 403);
  }

  await ensureGroupMember(user, task.groupwork_id);
  if (!task.is_private && Number(task.assigned_user_id) === Number(user.user_id) && task.status === 'Pending') {
    return taskRepository.updateStatus(taskId, 'In Progress');
  }
  if (!task.is_private && (user.role === 'Admin' || await groupworkRepository.isLeader(user.user_id, task.groupwork_id)) && task.status === 'Review') {
    return taskRepository.updateStatus(taskId, 'Completed');
  }
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

  if (task.is_private) {
    if (Number(task.assigned_user_id) !== Number(user.user_id) && user.role !== 'Admin') {
      throw new AppError('Only the owner can update a private task', 403);
    }

    return taskRepository.updateStatus(taskId, status);
  }

  const canLead = !task.is_private && (user.role === 'Admin' || await groupworkRepository.isLeader(user.user_id, task.groupwork_id));
  const isAssignedUser = Number(task.assigned_user_id) === Number(user.user_id);

  if (!canLead && !isAssignedUser) {
    throw new AppError('Only the assigned user, group leader, or admin can update task status', 403);
  }

  // Lifecycle changes are driven by viewing/submitting/reviewing, not an arbitrary status picker.
  if (!canLead && !['In Progress'].includes(status)) throw new AppError('Members cannot set task status directly', 403);
  return taskRepository.updateStatus(taskId, status);
}

async function remove(user, taskId) {
  const task = await taskRepository.findById(taskId);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (task.is_private) {
    if (Number(task.assigned_user_id) !== Number(user.user_id) && user.role !== 'Admin') {
      throw new AppError('Only the owner can delete a private task', 403);
    }
    await taskRepository.remove(taskId);
    return true;
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
  createPersonal,
  getAll,
  getById,
  update,
  updateStatus,
  remove,
  getByAssignment
};
