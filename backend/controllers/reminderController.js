import reminderService from '../services/reminderService.js';
import { sendSuccess } from '../utils/responses.js';

async function getAll(req, res, next) {
  try {
    const reminders = await reminderService.getAll(req.user);
    sendSuccess(res, 200, 'Reminders fetched successfully', reminders);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const reminder = await reminderService.create(req.user, req.body);
    sendSuccess(res, 201, 'Reminder created successfully', reminder);
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const reminder = await reminderService.markRead(req.user, req.params.id);
    sendSuccess(res, 200, 'Reminder marked as read', reminder);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await reminderService.remove(req.user, req.params.id);
    sendSuccess(res, 200, 'Reminder deleted successfully', null);
  } catch (error) {
    next(error);
  }
}

export default {
  getAll,
  create,
  markRead,
  remove
};
