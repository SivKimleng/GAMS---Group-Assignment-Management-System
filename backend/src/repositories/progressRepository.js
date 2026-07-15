import pool from '../config/db.js';

async function calculateByAssignmentId(assignmentId) {
  const [rows] = await pool.execute(
    `SELECT
       COUNT(*) AS total_tasks,
       COALESCE(SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END), 0) AS completed_tasks
     FROM tasks
     WHERE assignment_id = ?`,
    [assignmentId]
  );

  const totalTasks = Number(rows[0]?.total_tasks || 0);
  const completedTasks = Number(rows[0]?.completed_tasks || 0);
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    assignment_id: Number(assignmentId),
    completed_tasks: completedTasks,
    total_tasks: totalTasks,
    progress_percentage: progressPercentage
  };
}

export default {
  calculateByAssignmentId
};
