import pool from '../config/db.js';
import AppError from '../utils/AppError.js';
import groupworkRepository from '../repositories/groupworkRepository.js';
import reminderRepository from '../repositories/reminderRepository.js';
import { ensureGroupExists, ensureGroupLeader, ensureGroupMember } from './permissionService.js';

function generateGroupworkCode() {
  return `GAMS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function create(user, data) {
  const groupworkCode = (data.groupwork_code || generateGroupworkCode()).trim().toUpperCase();
  const existingCode = await groupworkRepository.findByCode(groupworkCode);

  if (existingCode) {
    throw new AppError('Groupwork code already exists', 409);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const groupworkId = await groupworkRepository.create({
      groupwork_name: data.groupwork_name.trim(),
      subject: data.subject.trim(),
      description: data.description,
      groupwork_code: groupworkCode,
      leader_user_id: user.user_id
    }, connection);

    await groupworkRepository.addMember(user.user_id, groupworkId, 'Leader', connection);
    await connection.commit();

    return groupworkRepository.findById(groupworkId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getAll(user) {
  return groupworkRepository.findAllForUser(user);
}

async function getById(user, groupworkId) {
  const groupwork = await ensureGroupExists(groupworkId);
  await ensureGroupMember(user, groupworkId);
  return groupwork;
}

async function update(user, groupworkId, data) {
  await ensureGroupExists(groupworkId);
  await ensureGroupLeader(user, groupworkId);

  if (data.groupwork_code) {
    const existingCode = await groupworkRepository.findByCode(data.groupwork_code.trim().toUpperCase());
    if (existingCode && existingCode.groupwork_id !== Number(groupworkId)) {
      throw new AppError('Groupwork code already exists', 409);
    }
  }

  return groupworkRepository.update(groupworkId, {
    groupwork_name: data.groupwork_name,
    subject: data.subject,
    description: data.description,
    groupwork_code: data.groupwork_code?.trim().toUpperCase()
  });
}

async function remove(user, groupworkId) {
  const groupwork = await ensureGroupExists(groupworkId);
  await ensureGroupLeader(user, groupworkId);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const memberIds = await groupworkRepository.findActiveMemberIds(groupworkId, connection);
    const message = `The group "${groupwork.groupwork_name}" has been deleted by its leader.`;
    for (const memberId of memberIds) {
      await reminderRepository.createSystemNotice(memberId, message, connection);
    }
    const deleted = await groupworkRepository.remove(groupworkId, connection);
    if (!deleted) throw new AppError('Groupwork not found', 404);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return true;
}

async function join(user, groupworkId, data) {
  let groupwork = await groupworkRepository.findById(groupworkId);

  if (!groupwork && data.groupwork_code) {
    groupwork = await groupworkRepository.findByCode(data.groupwork_code.trim().toUpperCase());
  }

  if (!groupwork) {
    throw new AppError('Groupwork not found', 404);
  }

  const existingMembership = await groupworkRepository.findMembership(user.user_id, groupwork.groupwork_id);

  if (existingMembership) {
    throw new AppError('You are already a member of this groupwork', 409);
  }

  await groupworkRepository.addMember(user.user_id, groupwork.groupwork_id, 'Member');
  return groupworkRepository.findById(groupwork.groupwork_id);
}

async function getMembers(user, groupworkId) {
  await ensureGroupExists(groupworkId);
  await ensureGroupMember(user, groupworkId);
  return groupworkRepository.findMembers(groupworkId);
}

async function removeMember(user, groupworkId, memberUserId) {
  await ensureGroupExists(groupworkId);
  await ensureGroupLeader(user, groupworkId);

  const membership = await groupworkRepository.findMembership(memberUserId, groupworkId);
  if (!membership) throw new AppError('Active group member not found', 404);
  if (membership.group_role === 'Leader') {
    throw new AppError('The group leader cannot be removed from the group', 400);
  }

  const removed = await groupworkRepository.removeMember(memberUserId, groupworkId);
  if (!removed) throw new AppError('Could not remove group member', 400);
  return true;
}

async function leave(user, groupworkId) {
  const groupwork = await ensureGroupExists(groupworkId);
  const membership = await groupworkRepository.findMembership(user.user_id, groupworkId);
  if (!membership && user.role !== 'Admin') throw new AppError('You are not an active group member', 403);

  if (membership?.group_role === 'Leader' || Number(groupwork.leader_user_id) === Number(user.user_id)) {
    await remove(user, groupworkId);
    return { deleted: true };
  }

  const left = await groupworkRepository.removeMember(user.user_id, groupworkId);
  if (!left) throw new AppError('Could not leave group', 400);
  return { deleted: false };
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
