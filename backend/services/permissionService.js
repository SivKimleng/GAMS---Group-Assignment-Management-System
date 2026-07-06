import AppError from '../utils/AppError.js';
import groupworkRepository from '../repositories/groupworkRepository.js';

export async function ensureGroupExists(groupworkId) {
  const groupwork = await groupworkRepository.findById(groupworkId);

  if (!groupwork) {
    throw new AppError('Groupwork not found', 404);
  }

  return groupwork;
}

export async function ensureGroupMember(user, groupworkId) {
  if (user.role === 'Admin') {
    return true;
  }

  const membership = await groupworkRepository.findMembership(user.user_id, groupworkId);

  if (!membership) {
    throw new AppError('You must be a group member to access this resource', 403);
  }

  return true;
}

export async function ensureGroupLeader(user, groupworkId) {
  if (user.role === 'Admin') {
    return true;
  }

  const isLeader = await groupworkRepository.isLeader(user.user_id, groupworkId);

  if (!isLeader) {
    throw new AppError('Only the group leader or admin can perform this action', 403);
  }

  return true;
}
