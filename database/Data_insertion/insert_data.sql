USE GAMS;

INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES
('Demo', 'Student', 'demo.student@gams.edu', 'demo_hash_001', 'Student'),
('Nita', 'Chen', 'nita.chen@gams.edu', 'demo_hash_002', 'Student'),
('Rithy', 'San', 'rithy.san@gams.edu', 'demo_hash_003', 'Student'),
('Mina', 'Sok', 'mina.sok@gams.edu', 'demo_hash_004', 'Student');

INSERT INTO groupwork (groupwork_name, subject, description, groupwork_code, leader_user_id) VALUES
('Data Science Project', 'AI & Data Mining', 'Team for the AI ethics and data mining final assignment.', 'DSP-2026', 1),
('Mobile App Team', 'Cross Platform', 'Team building the mobile UI prototype and authentication review.', 'MAT-2026', 3),
('Research Writing', 'Academic English', 'Team preparing the final research draft and literature review.', 'RW-2026', 2);

INSERT INTO user_groups (user_id, group_id, member_role, membership_status) VALUES
(1, 1, 'Leader', 'Active'),
(2, 1, 'Member', 'Active'),
(3, 1, 'Member', 'Active'),
(4, 1, 'Member', 'Active'),
(3, 2, 'Leader', 'Active'),
(1, 2, 'Member', 'Active'),
(4, 2, 'Member', 'Active'),
(2, 3, 'Leader', 'Active'),
(1, 3, 'Member', 'Active'),
(4, 3, 'Member', 'Active');

INSERT INTO assignments (group_id, title, description, due_date, status, priority, created_by_user_id) VALUES
(1, 'AI Ethics Presentation', 'Prepare slides and talking points for the AI ethics group presentation.', '2026-07-05', 'In Progress', 'High', 1),
(2, 'Mobile UI Prototype', 'Finish the prototype review and dashboard wireframe for the mobile app project.', '2026-07-08', 'Review', 'Medium', 3),
(3, 'Research Draft', 'Complete literature review and first full research report draft.', '2026-07-12', 'Pending', 'Medium', 2);

INSERT INTO tasks (assignment_id, assigned_user_id, title, description, status, priority, due_date) VALUES
(1, 1, 'Prepare ER diagram', 'Create the database ER diagram for the final project submission.', 'In Progress', 'High', '2026-07-01'),
(1, 2, 'Collect survey data', 'Gather and clean survey responses for the AI ethics presentation.', 'In Progress', 'High', '2026-07-02'),
(1, 3, 'Build dashboard chart', 'Prepare a chart showing assignment progress for the presentation.', 'Pending', 'High', '2026-06-28'),
(2, 1, 'Review authentication flow', 'Check login and sign up user flow before prototype demo.', 'Pending', 'Medium', '2026-07-03'),
(2, 4, 'Create dashboard wireframe', 'Design the dashboard wireframe for the mobile UI prototype.', 'In Progress', 'Medium', '2026-07-04'),
(3, 2, 'Finalize literature review', 'Finish citations and summary for the literature review section.', 'Completed', 'Medium', '2026-06-25'),
(3, 4, 'Prepare presentation visuals', 'Create visual slides for the research writing presentation.', 'In Progress', 'Low', '2026-07-10');

INSERT INTO progress (task_id, user_id, status, progress_percent, notes) VALUES
(1, 1, 'In Progress', 70, 'Main entities and relationships drafted.'),
(2, 2, 'In Progress', 60, 'Survey responses collected from classmates.'),
(3, 3, 'Pending', 20, 'Waiting for final chart data.'),
(4, 1, 'Pending', 10, 'Authentication pages identified for review.'),
(5, 4, 'In Progress', 65, 'Dashboard layout is almost ready.'),
(6, 2, 'Completed', 100, 'Literature review completed and shared.'),
(7, 4, 'In Progress', 45, 'Visual style and slide order selected.');

INSERT INTO reminders (task_id, user_id, reminder_type, message, reminder_date, status) VALUES
(1, 1, 'Deadline', 'ER diagram is due soon.', '2026-07-01 09:00:00', 'Pending'),
(2, 2, 'Deadline', 'Survey data collection deadline is tomorrow.', '2026-07-01 14:00:00', 'Pending'),
(3, 3, 'Follow Up', 'Dashboard chart is overdue. Please update progress.', '2026-06-30 10:00:00', 'Pending'),
(4, 1, 'Deadline', 'Review authentication flow before prototype demo.', '2026-07-02 09:00:00', 'Pending'),
(5, 4, 'Task Update', 'Share dashboard wireframe progress with the group.', '2026-07-03 15:00:00', 'Pending'),
(7, 4, 'Meeting', 'Prepare visuals before the research team check-in.', '2026-07-08 13:00:00', 'Pending');
