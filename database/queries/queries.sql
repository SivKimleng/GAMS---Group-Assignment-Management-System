USE GAMS;

-- 1. Show all users and their groups.
SELECT
    u.user_id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email,
    g.groupwork_name,
    ug.member_role,
    ug.membership_status
FROM users u
LEFT JOIN user_groups ug ON u.user_id = ug.user_id
LEFT JOIN groupwork g ON ug.group_id = g.group_id
ORDER BY u.user_id, g.groupwork_name;

-- 2. Show group leader and group members.
SELECT
    g.groupwork_name,
    CONCAT(leader.first_name, ' ', leader.last_name) AS group_leader,
    CONCAT(member.first_name, ' ', member.last_name) AS member_name,
    ug.member_role
FROM groupwork g
LEFT JOIN users leader ON g.leader_user_id = leader.user_id
LEFT JOIN user_groups ug ON g.group_id = ug.group_id
LEFT JOIN users member ON ug.user_id = member.user_id
WHERE ug.membership_status = 'Active'
ORDER BY g.groupwork_name, ug.member_role, member_name;

-- 3. Show all assignments in each group.
SELECT
    g.groupwork_name,
    a.assignment_id,
    a.title AS assignment_title,
    a.status,
    a.priority,
    a.due_date
FROM groupwork g
JOIN assignments a ON g.group_id = a.group_id
ORDER BY g.groupwork_name, a.due_date;

-- 4. Show all tasks under each assignment.
SELECT
    a.title AS assignment_title,
    t.task_id,
    t.title AS task_title,
    t.status,
    t.priority,
    t.due_date
FROM assignments a
JOIN tasks t ON a.assignment_id = t.assignment_id
ORDER BY a.assignment_id, t.due_date;

-- 5. Show tasks assigned to each user.
SELECT
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to,
    g.groupwork_name,
    a.title AS assignment_title,
    t.title AS task_title,
    t.status,
    t.due_date
FROM users u
JOIN tasks t ON u.user_id = t.assigned_user_id
JOIN assignments a ON t.assignment_id = a.assignment_id
JOIN groupwork g ON a.group_id = g.group_id
ORDER BY assigned_to, t.due_date;

-- 6. Show task status and priority.
SELECT
    t.title AS task_title,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to,
    t.status,
    t.priority,
    t.due_date
FROM tasks t
LEFT JOIN users u ON t.assigned_user_id = u.user_id
ORDER BY
    FIELD(t.priority, 'High', 'Medium', 'Low'),
    t.due_date;

-- 7. Show completed and pending tasks.
SELECT
    t.title AS task_title,
    t.status,
    t.priority,
    t.due_date,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to
FROM tasks t
LEFT JOIN users u ON t.assigned_user_id = u.user_id
WHERE t.status IN ('Completed', 'Pending')
ORDER BY t.status, t.due_date;

-- 8. Calculate assignment progress percentage from completed tasks.
SELECT
    a.assignment_id,
    a.title AS assignment_title,
    g.groupwork_name,
    COUNT(t.task_id) AS total_tasks,
    SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks,
    ROUND(
        CASE
            WHEN COUNT(t.task_id) = 0 THEN 0
            ELSE SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) * 100 / COUNT(t.task_id)
        END,
        0
    ) AS progress_percentage
FROM assignments a
JOIN groupwork g ON a.group_id = g.group_id
LEFT JOIN tasks t ON a.assignment_id = t.assignment_id
GROUP BY a.assignment_id, a.title, g.groupwork_name
ORDER BY g.groupwork_name, a.title;

-- 9. Show upcoming reminders.
SELECT
    r.reminder_id,
    r.reminder_date,
    r.reminder_message,
    r.is_read,
    t.title AS task_title,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to
FROM reminders r
JOIN tasks t ON r.task_id = t.task_id
LEFT JOIN users u ON t.assigned_user_id = u.user_id
WHERE r.is_read = FALSE
  AND r.reminder_date >= NOW()
ORDER BY r.reminder_date;

-- 10. Show overdue tasks.
SELECT
    t.task_id,
    t.title AS task_title,
    t.status,
    t.priority,
    t.due_date,
    a.title AS assignment_title,
    g.groupwork_name,
    CONCAT(u.first_name, ' ', u.last_name) AS assigned_to
FROM tasks t
JOIN assignments a ON t.assignment_id = a.assignment_id
JOIN groupwork g ON a.group_id = g.group_id
LEFT JOIN users u ON t.assigned_user_id = u.user_id
WHERE t.due_date < CURDATE()
  AND t.status <> 'Completed'
ORDER BY t.due_date;