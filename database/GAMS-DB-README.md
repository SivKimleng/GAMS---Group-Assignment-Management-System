# GAMS Database

This folder contains the MySQL database files for **GAMS - Group Assignment Management System**. The database supports university students who create groups, join groups, manage assignments, assign tasks, track progress, and receive deadline reminders.

## Main Tables

- `users`: stores student account information such as name, email, password hash, and role.
- `groups`: stores assignment groups, subjects, group codes, and the group leader.
- `user_groups`: connects users to groups and stores each member role.
- `assignments`: stores group assignments, due dates, status, and priority.
- `tasks`: stores tasks under assignments, assigned users, status, priority, and due dates.
- `progress`: stores task progress records and progress percentages.
- `reminders`: stores reminder messages and reminder dates for tasks.

## Relationships

- One user can belong to many groups.
- One group can have many users through `user_groups`.
- One group has one leader through `groups.leader_user_id`.
- One group can have many assignments.
- One assignment can have many tasks.
- One task can be assigned to one user.
- One task can have many progress records.
- One task can have many reminders.

Child records such as group members, assignments, tasks, progress records, and reminders use foreign keys. Most child records use `ON DELETE CASCADE` so deleting a parent record also removes related child data. User references that should not destroy project history, such as task assignee and group leader, use `ON DELETE SET NULL`.

## How To Run

Run the files in this order from MySQL:

```sql
SOURCE database/schema.sql;
SOURCE database/insert_data.sql;
SOURCE database/indexes.sql;
SOURCE database/queries.sql;
```

If you are already inside the `database` folder, run:

```sql
SOURCE schema.sql;
SOURCE insert_data.sql;
SOURCE indexes.sql;
SOURCE queries.sql;
```

## Example Queries

The `queries.sql` file includes test queries for:

- Showing all users and their groups.
- Showing each group leader and group members.
- Showing all assignments in each group.
- Showing all tasks under each assignment.
- Showing tasks assigned to each user.
- Showing task status and priority.
- Showing completed and pending tasks.
- Calculating assignment progress percentage.
- Showing upcoming reminders.
- Showing overdue tasks.

## Frontend Support

The current frontend uses mock data for:

- Groups with members, subject, and progress.
- Assignments with status, priority, and progress.
- Tasks with assignee, status, priority, and due date.
- Deadlines and reminders.
- Leader/member views.

This database supports those same data needs through the `groups`, `user_groups`, `assignments`, `tasks`, `progress`, and `reminders` tables.

## Presentation Explanation

GAMS uses a relational MySQL database. Users can join many groups, and groups can have many users, so the database uses a junction table called `user_groups`. Each group owns assignments, each assignment owns tasks, and tasks can have progress updates and reminders. Foreign keys keep the data connected and prevent invalid records. This makes it easy to show dashboards, task lists, group members, assignment progress, upcoming reminders, and overdue work.
