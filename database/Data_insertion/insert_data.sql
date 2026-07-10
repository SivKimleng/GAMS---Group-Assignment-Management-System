USE GAMS;

-- Demo password for all users: Password123!
INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES
('Demo', 'Student', 'demo.student@gams.edu', '$2b$10$qVCUuOwm00GXsTpDpajcK.J.8gM/PZrGHQlKYnqkPmoORMFt3pFxO', 'Student'),
('Nita', 'Chen', 'nita.chen@gams.edu', '$2b$10$EtK0PHve0zhTgNKFS09Y..kwewMkofBSx3e9vnF5Ji.ToOH.Aa0Um', 'Student'),
('Rithy', 'San', 'rithy.san@gams.edu', '$2b$10$p5HdhptJdzTM/la.EcwIIukcswZGj5OnSYVEzK1OL72QwLIhzOeNK', 'Student'),
('Mina', 'Sok', 'mina.sok@gams.edu', '$2b$10$Jc7yPGNNplOVlYTBc.woROKHemfagdLGXnQPrZfTwjg4yrCfrePlm', 'Student'),
('Admin', 'User', 'admin@gams.edu', '$2b$10$qVCUuOwm00GXsTpDpajcK.J.8gM/PZrGHQlKYnqkPmoORMFt3pFxO', 'Admin');

INSERT INTO groupwork (groupwork_name, subject, description, groupwork_code, leader_user_id) VALUES
('Data Science Project', 'AI and Data Mining', 'Team for the AI ethics and data mining final assignment.', 'DSP-2026', 1),
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
(1, 'AI Ethics Presentation', 'Prepare slides and talking points for the AI ethics group presentation.', '2026-07-20', 'In Progress', 'High', 1),
(2, 'Mobile UI Prototype', 'Finish the prototype review and dashboard wireframe for the mobile app project.', '2026-07-22', 'In Progress', 'Medium', 3),
(3, 'Research Draft', 'Complete literature review and first full research report draft.', '2026-07-28', 'Not Started', 'Medium', 2);

INSERT INTO tasks (assignment_id, assigned_user_id, title, description, status, priority, due_date) VALUES
(1, 1, 'Prepare ER diagram', 'Create the database ER diagram for the final project submission.', 'In Progress', 'High', '2026-07-15'),
(1, 2, 'Collect survey data', 'Gather and clean survey responses for the AI ethics presentation.', 'In Progress', 'High', '2026-07-16'),
(1, 3, 'Build dashboard chart', 'Prepare a chart showing assignment progress for the presentation.', 'Pending', 'High', '2026-07-18'),
(2, 1, 'Review authentication flow', 'Check login and sign up user flow before prototype demo.', 'Pending', 'Medium', '2026-07-17'),
(2, 4, 'Create dashboard wireframe', 'Design the dashboard wireframe for the mobile UI prototype.', 'In Progress', 'Medium', '2026-07-19'),
(3, 2, 'Finalize literature review', 'Finish citations and summary for the literature review section.', 'Completed', 'Medium', '2026-07-21'),
(3, 4, 'Prepare presentation visuals', 'Create visual slides for the research writing presentation.', 'In Progress', 'Low', '2026-07-25');

INSERT INTO reminders (task_id, user_id, assignment_id, reminder_message, reminder_date, is_read) VALUES
(1, 1, 1, 'ER diagram is due soon.', '2026-07-15 09:00:00', FALSE),
(2, 2, 1, 'Survey data collection deadline is tomorrow.', '2026-07-15 14:00:00', FALSE),
(3, 3, 1, 'Dashboard chart deadline is coming soon. Please update progress.', '2026-07-17 10:00:00', FALSE),
(4, 1, 2, 'Review authentication flow before prototype demo.', '2026-07-16 09:00:00', FALSE),
(5, 4, 2, 'Share dashboard wireframe progress with the group.', '2026-07-18 15:00:00', FALSE),
(7, 4, 3, 'Prepare visuals before the research team check-in.', '2026-07-24 13:00:00', FALSE);
