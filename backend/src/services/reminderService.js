import AppError from '../utils/AppError.js';
import assignmentRepository from '../repositories/assignmentRepository.js';
import taskRepository from '../repositories/taskRepository.js';
import reminderRepository from '../repositories/reminderRepository.js';
import { ensureGroupMember } from './permissionService.js';

async function ensureReminderOwner(user, reminderId) {
  const reminder = await reminderRepository.findById(reminderId);

  if (!reminder) {
    throw new AppError('Reminder not found', 404);
  }

  if (user.role !== 'Admin' && reminder.user_id !== user.user_id) {
    throw new AppError('You can only manage your own reminders', 403);
  }

  return reminder;
}

async function ensureReminderTargetAccess(user, data) {
  if (!data.assignment_id && !data.task_id) {
    throw new AppError('assignment_id or task_id is required', 400);
  }

  if (data.task_id) {
    const task = await taskRepository.findById(data.task_id);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    await ensureGroupMember(user, task.groupwork_id);
    return {
      task_id: task.task_id,
      assignment_id: data.assignment_id || task.assignment_id
    };
  }

  const assignment = await assignmentRepository.findById(data.assignment_id);

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  await ensureGroupMember(user, assignment.groupwork_id);
  return {
    task_id: null,
    assignment_id: assignment.assignment_id
  };
}

async function getAll(user) {
  return reminderRepository.findAllForUser(user);
}

async function create(user, data) {
  if (!data.reminder_message?.trim()) {
    throw new AppError('reminder_message is required', 400);
  }

  if (!data.reminder_date) {
    throw new AppError('reminder_date is required', 400);
  }

  const target = await ensureReminderTargetAccess(user, data);

  return reminderRepository.create({
    user_id: user.user_id,
    task_id: target.task_id,
    assignment_id: target.assignment_id,
    reminder_message: data.reminder_message.trim(),
    reminder_date: data.reminder_date
  });
}

async function markRead(user, reminderId) {
  await ensureReminderOwner(user, reminderId);
  return reminderRepository.markRead(reminderId);
}

async function remove(user, reminderId) {
  await ensureReminderOwner(user, reminderId);
  await reminderRepository.remove(reminderId);
  return true;
}

export default {
  getAll,
  create,
  markRead,
  remove
};
