import pool from '../config/db.js';

const reminderSelect = `
  r.reminder_id,
  r.user_id,
  r.task_id,
  r.assignment_id,
  r.reminder_message,
  r.reminder_date,
  r.is_read,
  r.created_at,
  t.title AS task_name,
  a.title AS assignment_name,
  g.groupwork_name
`;

async function findAllForUser(user) {
  const adminSql = `
    SELECT ${reminderSelect}
    FROM reminders r
    LEFT JOIN tasks t ON t.task_id = r.task_id
    LEFT JOIN assignments a ON a.assignment_id = COALESCE(r.assignment_id, t.assignment_id)
    LEFT JOIN groupwork g ON g.group_id = a.group_id
    ORDER BY r.is_read ASC, r.reminder_date ASC, r.created_at DESC
  `;

  const userSql = `
    SELECT ${reminderSelect}
    FROM reminders r
    LEFT JOIN tasks t ON t.task_id = r.task_id
    LEFT JOIN assignments a ON a.assignment_id = COALESCE(r.assignment_id, t.assignment_id)
    LEFT JOIN groupwork g ON g.group_id = a.group_id
    WHERE r.user_id = ?
    ORDER BY r.is_read ASC, r.reminder_date ASC, r.created_at DESC
  `;

  const [rows] = user.role === 'Admin'
    ? await pool.execute(adminSql)
    : await pool.execute(userSql, [user.user_id]);

  return rows;
}

async function findById(reminderId) {
  const [rows] = await pool.execute(
    `SELECT ${reminderSelect}
     FROM reminders r
     LEFT JOIN tasks t ON t.task_id = r.task_id
     LEFT JOIN assignments a ON a.assignment_id = COALESCE(r.assignment_id, t.assignment_id)
     LEFT JOIN groupwork g ON g.group_id = a.group_id
     WHERE r.reminder_id = ?`,
    [reminderId]
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO reminders (user_id, task_id, assignment_id, reminder_message, reminder_date, is_read)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [
      data.user_id,
      data.task_id || null,
      data.assignment_id || null,
      data.reminder_message,
      data.reminder_date
    ]
  );

  return findById(result.insertId);
}

async function markRead(reminderId) {
  await pool.execute(
    `UPDATE reminders SET is_read = 1 WHERE reminder_id = ?`,
    [reminderId]
  );
  return findById(reminderId);
}

async function remove(reminderId) {
  const [result] = await pool.execute(
    `DELETE FROM reminders WHERE reminder_id = ?`,
    [reminderId]
  );
  return result.affectedRows > 0;
}

export default {
  findAllForUser,
  findById,
  create,
  markRead,
  remove
};
