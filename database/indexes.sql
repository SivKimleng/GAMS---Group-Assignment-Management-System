USE GAMS;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_assignments_group_id ON assignments(group_id);
CREATE INDEX idx_tasks_assignment_id ON tasks(assignment_id);
CREATE INDEX idx_tasks_assigned_user_id ON tasks(assigned_user_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_task_id ON reminders(task_id);
CREATE INDEX idx_reminders_assignment_id ON reminders(assignment_id);
CREATE INDEX idx_reminders_reminder_date ON reminders(reminder_date);
