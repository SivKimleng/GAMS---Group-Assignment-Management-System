# GAMS Database

This folder contains the MySQL database files for **GAMS - Group Assignment Management System**. The database supports university students who create groups, join groups, manage assignments, assign tasks, track progress, and receive deadline reminders.

## Main Tables

- `users`: stores student account information such as name, email, password hash, and role.
- `groupwork`: stores assignment groups, subjects, group codes, and the group leader.
- `user_groups`: connects users to groups and stores each member role.
- `assignments`: stores group assignments, due dates, status, and priority.
- `tasks`: stores tasks under assignments, assigned users, status, priority, and due dates.
- Progress is calculated dynamically from task completion, so the current cloud database does not require a separate `progress` table.
- `reminders`: stores user reminder messages, reminder dates, read status, and optional links to tasks or assignments.

## Relationships

- One user can belong to many groupworks.
- One groupwork can have many users through `user_groups`.
- One groupwork has one leader through `groupwork.leader_user_id`.
- One group can have many assignments.
- One assignment can have many tasks.
- One task can be assigned to one user.
- Assignment progress is calculated from completed tasks divided by total tasks.
- One task or assignment can have many reminders.

Child records such as group members, assignments, tasks, and reminders use foreign keys. Most child records use `ON DELETE CASCADE` so deleting a parent record also removes related child data. User references that should not destroy project history, such as task assignee and group leader, use `ON DELETE SET NULL`.

## How To Run

Run the files in this order from MySQL:

```sql
SOURCE database/schemas/schema.sql;
SOURCE database/Data_insertion/insert_data.sql;
SOURCE database/indexes.sql;
SOURCE database/queries/queries.sql;
```

If you are already inside the `database` folder, run:

```sql
SOURCE schemas/schema.sql;
SOURCE Data_insertion/insert_data.sql;
SOURCE indexes.sql;
SOURCE queries/queries.sql;
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
- Calculating assignment progress percentage from tasks.
- Showing upcoming reminders.
- Showing overdue tasks.

## Frontend Support

The current frontend can call the backend at `http://localhost:5000/api`. Some screens still use mock data, but the database supports:

- Groups with members, subject, and progress.
- Assignments with status, priority, and progress.
- Tasks with assignee, status, priority, and due date.
- Deadlines and reminders.
- Leader/member views.

This database supports those same data needs through the `groupwork`, `user_groups`, `assignments`, `tasks`, `progress`, and `reminders` tables.

## Presentation Explanation

GAMS uses a relational MySQL database. Users can join many groups, and groups can have many users, so the database uses a junction table called `user_groups`. Each group owns assignments, each assignment owns tasks, and tasks can have progress updates and reminders. Foreign keys keep the data connected and prevent invalid records. This makes it easy to show dashboards, task lists, group members, assignment progress, upcoming reminders, and overdue work.
