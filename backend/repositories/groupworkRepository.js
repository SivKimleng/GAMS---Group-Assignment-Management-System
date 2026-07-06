import pool from '../config/db.js';

const groupSelect = `
  g.group_id AS groupwork_id,
  g.groupwork_name,
  g.subject,
  g.description,
  g.groupwork_code,
  g.leader_user_id,
  COUNT(ug.user_id) AS member_count,
  g.created_at,
  g.updated_at
`;

async function findAllForUser(user) {
  const adminSql = `
    SELECT ${groupSelect}
    FROM groupwork g
    LEFT JOIN user_groups ug ON ug.group_id = g.group_id AND ug.membership_status = 'Active'
    GROUP BY g.group_id
    ORDER BY g.created_at DESC
  `;

  const memberSql = `
    SELECT ${groupSelect}
    FROM groupwork g
    INNER JOIN user_groups mine ON mine.group_id = g.group_id
      AND mine.user_id = ?
      AND mine.membership_status = 'Active'
    LEFT JOIN user_groups ug ON ug.group_id = g.group_id AND ug.membership_status = 'Active'
    GROUP BY g.group_id
    ORDER BY g.created_at DESC
  `;

  const [rows] = user.role === 'Admin'
    ? await pool.execute(adminSql)
    : await pool.execute(memberSql, [user.user_id]);

  return rows;
}

async function findById(groupworkId) {
  const [rows] = await pool.execute(
    `SELECT ${groupSelect}
     FROM groupwork g
     LEFT JOIN user_groups ug ON ug.group_id = g.group_id AND ug.membership_status = 'Active'
     WHERE g.group_id = ?
     GROUP BY g.group_id`,
    [groupworkId]
  );
  return rows[0] || null;
}

async function findByCode(groupworkCode) {
  const [rows] = await pool.execute(
    `SELECT group_id AS groupwork_id, groupwork_name, subject, description, groupwork_code, leader_user_id
     FROM groupwork
     WHERE groupwork_code = ?`,
    [groupworkCode]
  );
  return rows[0] || null;
}

async function create(data, connection = pool) {
  const [result] = await connection.execute(
    `INSERT INTO groupwork (groupwork_name, subject, description, groupwork_code, leader_user_id)
     VALUES (?, ?, ?, ?, ?)`,
    [data.groupwork_name, data.subject, data.description || null, data.groupwork_code, data.leader_user_id]
  );
  return result.insertId;
}

async function update(groupworkId, changes) {
  const allowed = {
    groupwork_name: 'groupwork_name',
    subject: 'subject',
    description: 'description',
    groupwork_code: 'groupwork_code'
  };
  const entries = Object.entries(changes).filter(([key, value]) => allowed[key] && value !== undefined);

  if (entries.length === 0) {
    return findById(groupworkId);
  }

  const setClause = entries.map(([key]) => `${allowed[key]} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(groupworkId);

  await pool.execute(`UPDATE groupwork SET ${setClause} WHERE group_id = ?`, values);
  return findById(groupworkId);
}

async function remove(groupworkId) {
  const [result] = await pool.execute(`DELETE FROM groupwork WHERE group_id = ?`, [groupworkId]);
  return result.affectedRows > 0;
}

async function addMember(userId, groupworkId, role = 'Member', connection = pool) {
  await connection.execute(
    `INSERT INTO user_groups (user_id, group_id, member_role, membership_status)
     VALUES (?, ?, ?, 'Active')
     ON DUPLICATE KEY UPDATE member_role = VALUES(member_role), membership_status = 'Active'`,
    [userId, groupworkId, role]
  );
}

async function findMembership(userId, groupworkId) {
  const [rows] = await pool.execute(
    `SELECT user_id, group_id AS groupwork_id, member_role AS group_role, membership_status, joined_at
     FROM user_groups
     WHERE user_id = ? AND group_id = ? AND membership_status = 'Active'`,
    [userId, groupworkId]
  );
  return rows[0] || null;
}

async function findMembers(groupworkId) {
  const [rows] = await pool.execute(
    `SELECT
       u.user_id,
       u.first_name,
       u.last_name,
       u.email,
       u.role,
       ug.member_role AS group_role,
       ug.joined_at
     FROM user_groups ug
     INNER JOIN users u ON u.user_id = ug.user_id
     WHERE ug.group_id = ? AND ug.membership_status = 'Active'
     ORDER BY ug.member_role = 'Leader' DESC, u.first_name`,
    [groupworkId]
  );
  return rows;
}

async function isLeader(userId, groupworkId) {
  const [rows] = await pool.execute(
    `SELECT 1
     FROM groupwork g
     LEFT JOIN user_groups ug ON ug.group_id = g.group_id
       AND ug.user_id = ?
       AND ug.membership_status = 'Active'
     WHERE g.group_id = ?
       AND (g.leader_user_id = ? OR ug.member_role = 'Leader')
     LIMIT 1`,
    [userId, groupworkId, userId]
  );
  return rows.length > 0;
}

export default {
  findAllForUser,
  findById,
  findByCode,
  create,
  update,
  remove,
  addMember,
  findMembership,
  findMembers,
  isLeader
};
