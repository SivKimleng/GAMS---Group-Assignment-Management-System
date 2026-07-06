import pool from '../config/db.js';

const taskSelect = `
  t.task_id,
  t.assignment_id,
  a.group_id AS groupwork_id,
  t.assigned_user_id,
  t.title AS task_name,
  t.description AS task_description,
  t.priority,
  t.status,
  t.due_date,
  t.created_at,
  t.updated_at
`;

async function findAllForUser(user) {
  const adminSql = `
    SELECT ${taskSelect}, a.title AS assignment_name, g.groupwork_name
    FROM tasks t
    INNER JOIN assignments a ON a.assignment_id = t.assignment_id
    INNER JOIN groupwork g ON g.group_id = a.group_id
    ORDER BY t.due_date ASC, t.task_id DESC
  `;

  const memberSql = `
    SELECT ${taskSelect}, a.title AS assignment_name, g.groupwork_name
    FROM tasks t
    INNER JOIN assignments a ON a.assignment_id = t.assignment_id
    INNER JOIN groupwork g ON g.group_id = a.group_id
    INNER JOIN user_groups ug ON ug.group_id = a.group_id
      AND ug.user_id = ?
      AND ug.membership_status = 'Active'
    ORDER BY t.due_date ASC, t.task_id DESC
  `;

  const [rows] = user.role === 'Admin'
    ? await pool.execute(adminSql)
    : await pool.execute(memberSql, [user.user_id]);

  return rows;
}

async function findById(taskId) {
  const [rows] = await pool.execute(
    `SELECT ${taskSelect}, a.title AS assignment_name, g.groupwork_name
     FROM tasks t
     INNER JOIN assignments a ON a.assignment_id = t.assignment_id
     INNER JOIN groupwork g ON g.group_id = a.group_id
     WHERE t.task_id = ?`,
    [taskId]
  );
  return rows[0] || null;
}

async function findByAssignmentId(assignmentId) {
  const [rows] = await pool.execute(
    `SELECT ${taskSelect}
     FROM tasks t
     INNER JOIN assignments a ON a.assignment_id = t.assignment_id
     WHERE t.assignment_id = ?
     ORDER BY t.due_date ASC, t.task_id DESC`,
    [assignmentId]
  );
  return rows;
}

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO tasks (assignment_id, assigned_user_id, title, description, priority, status, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.assignment_id,
      data.assigned_user_id || null,
      data.task_name,
      data.task_description || null,
      data.priority || 'Medium',
      data.status || 'Pending',
      data.due_date
    ]
  );
  return findById(result.insertId);
}

async function update(taskId, changes) {
  const allowed = {
    assignment_id: 'assignment_id',
    assigned_user_id: 'assigned_user_id',
    task_name: 'title',
    task_description: 'description',
    priority: 'priority',
    status: 'status',
    due_date: 'due_date'
  };
  const entries = Object.entries(changes).filter(([key, value]) => allowed[key] && value !== undefined);

  if (entries.length === 0) {
    return findById(taskId);
  }

  const setClause = entries.map(([key]) => `${allowed[key]} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(taskId);

  await pool.execute(`UPDATE tasks SET ${setClause} WHERE task_id = ?`, values);
  return findById(taskId);
}

async function updateStatus(taskId, status) {
  await pool.execute(`UPDATE tasks SET status = ? WHERE task_id = ?`, [status, taskId]);
  return findById(taskId);
}

async function remove(taskId) {
  const [result] = await pool.execute(`DELETE FROM tasks WHERE task_id = ?`, [taskId]);
  return result.affectedRows > 0;
}

export default {
  findAllForUser,
  findById,
  findByAssignmentId,
  create,
  update,
  updateStatus,
  remove
};
