import pool from '../config/db.js';
import AppError from '../utils/AppError.js';
import groupworkRepository from '../repositories/groupworkRepository.js';
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
  await ensureGroupExists(groupworkId);
  await ensureGroupLeader(user, groupworkId);

  const deleted = await groupworkRepository.remove(groupworkId);

  if (!deleted) {
    throw new AppError('Groupwork not found', 404);
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

export default {
  create,
  getAll,
  getById,
  update,
  remove,
  join,
  getMembers
};
