import AppError from '../utils/AppError.js';
import assignmentRepository from '../repositories/assignmentRepository.js';
import progressRepository from '../repositories/progressRepository.js';
import { ensureGroupMember } from './permissionService.js';

async function getByAssignment(user, assignmentId) {
  const assignment = await assignmentRepository.findById(assignmentId);

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  await ensureGroupMember(user, assignment.groupwork_id);
  return progressRepository.calculateByAssignmentId(assignmentId);
}

export default {
  getByAssignment
};
