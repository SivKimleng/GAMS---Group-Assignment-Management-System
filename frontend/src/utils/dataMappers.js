export const fallbackUser = {
  firstName: 'Student',
  fullName: 'Student'
};

export const SELECTED_GROUPWORK_STORAGE_KEY = 'gams_selected_groupwork_id';

const protectedStorageKeys = new Set(['token', 'user', 'gams_session', SELECTED_GROUPWORK_STORAGE_KEY]);

export function hasAuthToken() {
  return Boolean(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

export function cleanupDemoGroupStorage() {
  [localStorage, sessionStorage].forEach((storage) => {
    Object.keys(storage).forEach((key) => {
      if (protectedStorageKeys.has(key)) return;

      const value = storage.getItem(key) || '';
      const looksLikeDemoKey = /demo|mock|sample/i.test(key);
      const looksLikeDemoGroupValue = /Demo Group\s*\d*/i.test(value);
      const looksLikeCachedProjectData = /group|groupwork|workspace|dashboard|assignment|task/i.test(
        `${key} ${value.slice(0, 500)}`
      );

      if (looksLikeDemoKey || (looksLikeDemoGroupValue && looksLikeCachedProjectData)) {
        storage.removeItem(key);
      }
    });
  });
}

export function formatUser(user) {
  if (!user) return fallbackUser;

  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  const fullName = user.fullName || `${firstName} ${lastName}`.trim() || user.email || 'Student';

  return {
    ...user,
    firstName: firstName || fullName.split(' ')[0] || 'Student',
    fullName
  };
}

export function dateOrder(date) {
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

export function formatDateLabel(date) {
  if (!date) return 'No date';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'No date';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(parsedDate);
  targetDate.setHours(0, 0, 0, 0);
  const dayDifference = Math.round((targetDate - today) / 86400000);

  if (dayDifference === 0) return 'Today';
  if (dayDifference === 1) return 'Tomorrow';
  if (dayDifference === -1) return 'Yesterday';

  return parsedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function calculateTaskProgress(tasks) {
  if (!tasks.length) return 0;
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
  return Math.round((completedTasks / tasks.length) * 100);
}

export function calculateAssignmentProgress(assignment, tasks) {
  if (assignment.status === 'Completed') return 100;
  const assignmentTasks = tasks.filter((task) => Number(task.assignment_id) === Number(assignment.assignment_id));
  return calculateTaskProgress(assignmentTasks);
}

function normalizeId(id) {
  return id === null || id === undefined ? '' : String(id).trim();
}

function sameId(firstId, secondId) {
  return normalizeId(firstId) !== '' && normalizeId(firstId) === normalizeId(secondId);
}

function uniqueById(items, getId) {
  const seenIds = new Set();

  return items.filter((item) => {
    const id = normalizeId(getId(item));
    if (!id || seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
  });
}

export function getGroupworkId(groupwork) {
  return groupwork?.groupwork_id ?? groupwork?.group_id ?? groupwork?.id ?? '';
}

export function getAssignmentId(assignment) {
  return assignment?.assignment_id ?? assignment?.id ?? '';
}

export function getTaskId(task) {
  return task?.task_id ?? task?.id ?? '';
}

export function uniqueGroupworks(groupworks = []) {
  return uniqueById(groupworks, getGroupworkId);
}

export function uniqueAssignments(assignments = []) {
  return uniqueById(assignments, getAssignmentId);
}

export function uniqueTasks(tasks = []) {
  return uniqueById(tasks, getTaskId);
}

export function mapGroupwork(groupwork, assignments = [], tasks = []) {
  const groupworkId = getGroupworkId(groupwork);
  const groupAssignments = assignments.filter(
    (assignment) => sameId(assignment.groupwork_id, groupworkId)
  );
  const groupTasks = tasks.filter((task) => sameId(task.groupwork_id, groupworkId));
  const progress = groupAssignments.length
    ? Math.round(
        groupAssignments.reduce(
          (total, assignment) => total + calculateAssignmentProgress(assignment, tasks),
          0
        ) / groupAssignments.length
      )
    : calculateTaskProgress(groupTasks);

  return {
    id: groupworkId,
    name: groupwork.groupwork_name || groupwork.name || 'Untitled Group',
    code: groupwork.groupwork_code || groupwork.code || '',
    description: groupwork.description || '',
    leaderUserId: groupwork.leader_user_id || groupwork.leaderUserId || '',
    members: Number(groupwork.member_count || 0),
    subject: groupwork.subject || 'No subject',
    assignmentCount: groupAssignments.length,
    progress
  };
}

export function mapTask(task) {
  const assigneeName = task.assigned_user_name || task.assigned_user_email || 'Unassigned';

  return {
    id: task.task_id,
    assignmentId: task.assignment_id,
    groupworkId: task.groupwork_id,
    assignedUserId: task.assigned_user_id,
    title: task.task_name,
    group: task.groupwork_name || task.assignment_name || 'Assignment',
    assignment: task.assignment_name || 'Assignment',
    assignee: assigneeName,
    priority: task.priority || 'Medium',
    isPrivate: Boolean(task.is_private),
    status: task.status || 'Pending',
    due: formatDateLabel(task.due_date),
    dueDate: task.due_date,
    dueOrder: dateOrder(task.due_date)
  };
}

export function mapAssignment(assignment, tasks = []) {
  return {
    id: assignment.assignment_id,
    groupworkId: assignment.groupwork_id,
    title: assignment.assignment_name,
    description: assignment.assignment_description,
    group: assignment.groupwork_name || 'Groupwork',
    owner: assignment.created_by_user_id ? `Created by user #${assignment.created_by_user_id}` : 'Team',
    status: assignment.status || 'Pending',
    priority: assignment.priority || 'Medium',
    deadline: assignment.deadline,
    deadlineLabel: formatDateLabel(assignment.deadline),
    dueOrder: dateOrder(assignment.deadline),
    progress: calculateAssignmentProgress(assignment, tasks)
  };
}

export function buildDeadlines(assignments, tasks) {
  const assignmentDeadlines = assignments
    .filter((assignment) => assignment.deadline)
    .map((assignment) => ({
      id: `assignment-${assignment.assignment_id}`,
      title: assignment.assignment_name,
      date: formatDateLabel(assignment.deadline),
      priority: assignment.priority || 'Medium',
      dueOrder: dateOrder(assignment.deadline)
    }));

  const taskDeadlines = tasks
    .filter((task) => task.due_date && task.status !== 'Completed')
    .map((task) => ({
      id: `task-${task.task_id}`,
      title: task.task_name,
      date: formatDateLabel(task.due_date),
      priority: task.priority || 'Medium',
      dueOrder: dateOrder(task.due_date)
    }));

  return [...assignmentDeadlines, ...taskDeadlines]
    .sort((first, second) => first.dueOrder - second.dueOrder)
    .slice(0, 8);
}

export function buildDashboardStats(groups, tasks, deadlines) {
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
  const activeTasks = tasks.filter((task) => task.status !== 'Completed').length;

  return [
    { label: 'Total Groups', value: groups.length, detail: 'active groups', color: 'bg-[#073ca6]' },
    { label: 'Total Tasks', value: tasks.length, detail: `${activeTasks} active`, color: 'bg-[#139f98]' },
    {
      label: 'Completed Tasks',
      value: completedTasks,
      detail: tasks.length ? `${Math.round((completedTasks / tasks.length) * 100)}% done` : '0% done',
      color: 'bg-[#f59e0b]'
    },
    { label: 'Upcoming Deadlines', value: deadlines.length, detail: 'from backend', color: 'bg-[#ef4444]' }
  ];
}

export function buildProgressOverview(assignments, tasks, deadlines) {
  const completedAssignments = assignments.filter((assignment) => assignment.status === 'Completed').length;
  const assignmentCompletion = assignments.length
    ? Math.round((completedAssignments / assignments.length) * 100)
    : 0;
  const taskCompletion = calculateTaskProgress(tasks);
  const readyDeadlines = deadlines.filter((deadline) => deadline.priority !== 'High').length;
  const deadlineReadiness = deadlines.length ? Math.round((readyDeadlines / deadlines.length) * 100) : 100;

  return [
    {
      title: 'Assignment Completion',
      value: assignmentCompletion,
      description: `${completedAssignments}/${assignments.length} assignments completed.`,
      color: 'bg-[#073ca6]'
    },
    {
      title: 'Task Completion',
      value: taskCompletion,
      description: `${tasks.filter((task) => task.status === 'Completed').length}/${tasks.length} tasks completed.`,
      color: 'bg-[#139f98]'
    },
    {
      title: 'Deadline Readiness',
      value: deadlineReadiness,
      description: deadlines.length ? `${deadlines.length} upcoming items tracked.` : 'No upcoming deadlines yet.',
      color: 'bg-[#f59e0b]'
    }
  ];
}

export function buildNotifications(tasks, deadlines) {
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
  const highPriorityDeadlines = deadlines.filter((deadline) => deadline.priority === 'High').length;
  const activeTasks = tasks.filter((task) => task.status !== 'Completed').length;

  return [
    completedTasks ? `${completedTasks} task${completedTasks === 1 ? '' : 's'} completed.` : null,
    highPriorityDeadlines
      ? `${highPriorityDeadlines} high-priority deadline${highPriorityDeadlines === 1 ? '' : 's'} coming up.`
      : null,
    activeTasks ? `${activeTasks} active task${activeTasks === 1 ? '' : 's'} still need attention.` : null
  ].filter(Boolean);
}

export function buildWorkspaceSummary(groups, assignments, tasks, deadlines) {
  return [
    { label: 'Active Groups', value: groups.length },
    { label: 'Assignments', value: assignments.length },
    { label: 'Pending Tasks', value: tasks.filter((task) => task.status !== 'Completed').length },
    { label: 'Due Soon', value: deadlines.length }
  ];
}

export function mapMember(member, tasks = []) {
  const memberTasks = tasks.filter((task) => Number(task.assigned_user_id) === Number(member.user_id));
  const activeTasks = memberTasks.filter((task) => task.status !== 'Completed').length;
  const completedTasks = memberTasks.filter((task) => task.status === 'Completed').length;
  const name = `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email;

  return {
    id: member.user_id,
    name,
    role: member.group_role || member.role || 'Member',
    workload: calculateTaskProgress(memberTasks),
    status: activeTasks ? `${activeTasks} active` : completedTasks ? 'Complete' : 'No tasks'
  };
}

export function buildTimelineEvents(assignments, tasks, groups, currentUser = {}) {
  const groupEvents = groups.map((group) => ({
    id: `group-${group.groupwork_id}`,
    title: `${group.groupwork_name} created`,
    date: formatDateLabel(group.created_at),
    dateOrder: dateOrder(group.created_at),
    type: 'Group',
    group: group.subject || 'Groupwork',
    description: group.description || `Group code: ${group.groupwork_code || 'Not available'}`
  }));

  const taskEvents = tasks.map((task) => ({
    id: `task-${task.task_id}`,
    title: task.task_name,
    date: formatDateLabel(task.due_date),
    dateOrder: dateOrder(task.due_date),
    type: 'Task',
    taskId: task.task_id,
    assignmentId: task.assignment_id,
    groupworkId: task.groupwork_id,
    status: task.status,
    group: task.groupwork_name || task.assignment_name || 'Assignment',
    assignee: task.assigned_user_name || task.assigned_user_email || 'the team',
    description: task.task_description || `${task.status || 'Pending'} task for ${task.assigned_user_name || task.assigned_user_email || 'the team'}.`
  }));

  return [...groupEvents, ...taskEvents].sort(
    (first, second) => first.dateOrder - second.dateOrder
  );
}
