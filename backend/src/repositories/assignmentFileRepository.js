import pool from '../config/db.js';

async function findByAssignmentId(assignmentId) {
  const [rows] = await pool.execute(
    `SELECT assignment_file_id, assignment_id, file_name, file_url, created_at
     FROM assignment_files WHERE assignment_id = ? ORDER BY created_at ASC`,
    [assignmentId]
  );
  return rows;
}

async function create(assignmentId, fileName, fileUrl) {
  const [result] = await pool.execute(
    `INSERT INTO assignment_files (assignment_id, file_name, file_url) VALUES (?, ?, ?)`,
    [assignmentId, fileName, fileUrl]
  );
  const [rows] = await pool.execute(
    `SELECT assignment_file_id, assignment_id, file_name, file_url, created_at FROM assignment_files WHERE assignment_file_id = ?`,
    [result.insertId]
  );
  return rows[0];
}

export default { findByAssignmentId, create };
