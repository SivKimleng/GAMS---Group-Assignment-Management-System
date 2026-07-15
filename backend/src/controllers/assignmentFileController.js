import AppError from '../utils/AppError.js';
import assignmentRepository from '../repositories/assignmentRepository.js';
import assignmentFileRepository from '../repositories/assignmentFileRepository.js';
import { ensureGroupLeader, ensureGroupMember } from '../services/permissionService.js';
import { sendSuccess } from '../utils/responses.js';

async function getAll(req, res, next) {
  try {
    const assignment = await assignmentRepository.findById(req.params.assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);
    await ensureGroupMember(req.user, assignment.groupwork_id);
    sendSuccess(res, 200, 'Assignment materials fetched successfully', await assignmentFileRepository.findByAssignmentId(assignment.assignment_id));
  } catch (error) { next(error); }
}

async function create(req, res, next) {
  try {
    const assignment = await assignmentRepository.findById(req.params.assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);
    await ensureGroupLeader(req.user, assignment.groupwork_id);
    if (!req.body.file_name?.trim() || !req.body.file_url?.trim()) throw new AppError('file_name and file_url are required', 400);
    sendSuccess(res, 201, 'Assignment material added successfully', await assignmentFileRepository.create(assignment.assignment_id, req.body.file_name.trim(), req.body.file_url.trim()));
  } catch (error) { next(error); }
}

export default { getAll, create };
