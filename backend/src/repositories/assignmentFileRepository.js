import pool from '../config/db.js';

let hasAssignmentFilesTableCache;

async function hasAssignmentFilesTable() {
  if (hasAssignmentFilesTableCache !== undefined) {
    return hasAssignmentFilesTableCache;
  }

  const [rows] = await pool.execute(
    `SELECT 1
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'assignment_files'
     LIMIT 1`
  );
  hasAssignmentFilesTableCache = rows.length > 0;
  return hasAssignmentFilesTableCache;
}

async function findByAssignmentId(assignmentId) {
  if (!(await hasAssignmentFilesTable())) {
    return [];
  }

  const [rows] = await pool.execute(
    `SELECT assignment_file_id, assignment_id, file_name, file_url, created_at
     FROM assignment_files WHERE assignment_id = ? ORDER BY created_at ASC`,
    [assignmentId]
  );
  return rows;
}

async function create(assignmentId, fileName, fileUrl) {
  if (!(await hasAssignmentFilesTable())) {
    return null;
  }

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
