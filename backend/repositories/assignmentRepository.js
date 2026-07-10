import pool from '../config/db.js';

const assignmentSelect = `
  a.assignment_id,
  a.group_id AS groupwork_id,
  a.title AS assignment_name,
  a.description AS assignment_description,
  a.due_date AS deadline,
  a.status,
  a.priority,
  a.created_by_user_id,
  a.created_at,
  a.updated_at
`;

async function findAllForUser(user) {
  const adminSql = `
    SELECT ${assignmentSelect}, g.groupwork_name
    FROM assignments a
    INNER JOIN groupwork g ON g.group_id = a.group_id
    ORDER BY a.due_date ASC, a.assignment_id DESC
  `;

  const memberSql = `
    SELECT ${assignmentSelect}, g.groupwork_name
    FROM assignments a
    INNER JOIN groupwork g ON g.group_id = a.group_id
    INNER JOIN user_groups ug ON ug.group_id = a.group_id
      AND ug.user_id = ?
      AND ug.membership_status = 'Active'
    ORDER BY a.due_date ASC, a.assignment_id DESC
  `;

  const [rows] = user.role === 'Admin'
    ? await pool.execute(adminSql)
    : await pool.execute(memberSql, [user.user_id]);

  return rows;
}

async function findById(assignmentId) {
  const [rows] = await pool.execute(
    `SELECT ${assignmentSelect}, g.groupwork_name
     FROM assignments a
     INNER JOIN groupwork g ON g.group_id = a.group_id
     WHERE a.assignment_id = ?`,
    [assignmentId]
  );
  return rows[0] || null;
}

async function findByGroupworkId(groupworkId) {
  const [rows] = await pool.execute(
    `SELECT ${assignmentSelect}
     FROM assignments a
     WHERE a.group_id = ?
     ORDER BY a.due_date ASC, a.assignment_id DESC`,
    [groupworkId]
  );
  return rows;
}

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO assignments (group_id, title, description, due_date, status, priority, created_by_user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.groupwork_id,
      data.assignment_name,
      data.assignment_description || null,
      data.deadline,
      data.status || 'Pending',
      data.priority || 'Medium',
      data.created_by_user_id
    ]
  );
  return findById(result.insertId);
}

async function update(assignmentId, changes) {
  const allowed = {
    groupwork_id: 'group_id',
    assignment_name: 'title',
    assignment_description: 'description',
    deadline: 'due_date',
    status: 'status',
    priority: 'priority'
  };
  const entries = Object.entries(changes).filter(([key, value]) => allowed[key] && value !== undefined);

  if (entries.length === 0) {
    return findById(assignmentId);
  }

  const setClause = entries.map(([key]) => `${allowed[key]} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(assignmentId);

  await pool.execute(`UPDATE assignments SET ${setClause} WHERE assignment_id = ?`, values);
  return findById(assignmentId);
}

async function remove(assignmentId) {
  const [result] = await pool.execute(`DELETE FROM assignments WHERE assignment_id = ?`, [assignmentId]);
  return result.affectedRows > 0;
}

export default {
  findAllForUser,
  findById,
  findByGroupworkId,
  create,
  update,
  remove
};
