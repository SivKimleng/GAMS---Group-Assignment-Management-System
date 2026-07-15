import pool from '../config/db.js';

const select = `
  s.submission_id, s.task_id, s.submitted_by_user_id, s.submission_url, s.file_name,
  s.is_submitted, s.is_late, s.submitted_at, s.updated_at
`;

async function findByTaskId(taskId) {
  const [rows] = await pool.execute(`SELECT ${select} FROM submissions s WHERE s.task_id = ?`, [taskId]);
  const submission = rows[0] || null;
  if (!submission) return null;
  const [materials] = await pool.execute(
    `SELECT submission_material_id, material_name, material_url, created_at
     FROM submission_materials WHERE submission_id = ? ORDER BY submission_material_id ASC`,
    [submission.submission_id]
  );
  return { ...submission, materials };
}

async function submit({ taskId, userId, materials, isLate }) {
  const first = materials[0];
  const [result] = await pool.execute(
    `INSERT INTO submissions (task_id, submitted_by_user_id, submission_url, file_name, is_submitted, is_late, submitted_at)
     VALUES (?, ?, ?, ?, 1, ?, NOW())
     ON DUPLICATE KEY UPDATE submitted_by_user_id = VALUES(submitted_by_user_id), submission_url = VALUES(submission_url),
       file_name = VALUES(file_name), is_submitted = 1, is_late = VALUES(is_late), submitted_at = NOW()`,
    [taskId, userId, first.material_url, first.material_name || null, isLate ? 1 : 0]
  );
  const submissionId = result.insertId || (await findByTaskId(taskId)).submission_id;
  await pool.execute(`DELETE FROM submission_materials WHERE submission_id = ?`, [submissionId]);
  for (const material of materials) {
    await pool.execute(
      `INSERT INTO submission_materials (submission_id, material_name, material_url) VALUES (?, ?, ?)`,
      [submissionId, material.material_name || 'Submission link', material.material_url]
    );
  }
  return findByTaskId(taskId);
}

async function unsubmit(taskId) {
  await pool.execute(`UPDATE submissions SET is_submitted = 0 WHERE task_id = ?`, [taskId]);
  return findByTaskId(taskId);
}

export default { findByTaskId, submit, unsubmit };
