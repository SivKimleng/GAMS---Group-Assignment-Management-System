import AppError from '../utils/AppError.js';
import taskRepository from '../repositories/taskRepository.js';
import groupworkRepository from '../repositories/groupworkRepository.js';
import submissionRepository from '../repositories/submissionRepository.js';

async function get(user, taskId) {
  const task = await taskRepository.findById(taskId);
  if (!task) throw new AppError('Task not found', 404);
  const leader = user.role === 'Admin' || await groupworkRepository.isLeader(user.user_id, task.groupwork_id);
  if (!leader && Number(task.assigned_user_id) !== Number(user.user_id)) throw new AppError('You cannot access this submission', 403);
  const submission = await submissionRepository.findByTaskId(taskId);
  if (leader && submission?.is_submitted) await taskRepository.updateStatus(taskId, 'Completed');
  return submission;
}

async function submit(user, taskId, data) {
  const task = await taskRepository.findById(taskId);
  if (!task) throw new AppError('Task not found', 404);
  if (Number(task.assigned_user_id) !== Number(user.user_id)) throw new AppError('Only the assigned member can submit this task', 403);
  const materials = Array.isArray(data.materials) ? data.materials : data.submission_url ? [{ material_name: data.file_name || 'Submission link', material_url: data.submission_url }] : [];
  const validMaterials = materials.filter((material) => material?.material_url?.trim());
  if (!validMaterials.length) throw new AppError('Upload at least one file or provide a link before submitting', 400);
  const isLate = task.due_date && new Date(`${task.due_date}T23:59:59`).getTime() < Date.now();
  const submission = await submissionRepository.submit({ taskId, userId: user.user_id, materials: validMaterials.map((material) => ({ material_name: material.material_name?.trim() || 'Submission link', material_url: material.material_url.trim() })), isLate });
  await taskRepository.updateStatus(taskId, 'Review');
  return submission;
}

async function unsubmit(user, taskId) {
  const task = await taskRepository.findById(taskId);
  if (!task) throw new AppError('Task not found', 404);
  if (Number(task.assigned_user_id) !== Number(user.user_id)) throw new AppError('Only the assigned member can un-submit this task', 403);
  const current = await submissionRepository.findByTaskId(taskId);
  if (!current) throw new AppError('No submission exists for this task', 404);
  const submission = await submissionRepository.unsubmit(taskId);
  await taskRepository.updateStatus(taskId, 'In Progress');
  return submission;
}

export default { get, submit, unsubmit };
