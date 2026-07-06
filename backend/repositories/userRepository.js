import pool from '../config/db.js';

const publicFields = `
  user_id,
  first_name,
  last_name,
  email,
  role,
  created_at,
  updated_at
`;

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT ${publicFields} FROM users ORDER BY user_id`
  );
  return rows;
}

async function findById(userId) {
  const [rows] = await pool.execute(
    `SELECT ${publicFields} FROM users WHERE user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT user_id, first_name, last_name, email, password_hash, role, created_at, updated_at
     FROM users
     WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
}

async function create(user) {
  const [result] = await pool.execute(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [user.first_name, user.last_name, user.email, user.password_hash, user.role]
  );
  return findById(result.insertId);
}

async function update(userId, changes) {
  const allowed = {
    first_name: 'first_name',
    last_name: 'last_name',
    email: 'email',
    password_hash: 'password_hash',
    role: 'role'
  };

  const entries = Object.entries(changes).filter(([key, value]) => allowed[key] && value !== undefined);

  if (entries.length === 0) {
    return findById(userId);
  }

  const setClause = entries.map(([key]) => `${allowed[key]} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  values.push(userId);

  await pool.execute(`UPDATE users SET ${setClause} WHERE user_id = ?`, values);
  return findById(userId);
}

async function remove(userId) {
  const [result] = await pool.execute(`DELETE FROM users WHERE user_id = ?`, [userId]);
  return result.affectedRows > 0;
}

export default {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  remove
};
