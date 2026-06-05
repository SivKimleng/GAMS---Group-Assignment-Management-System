export const features = [
  {
    icon: '01',
    title: 'Task Distribution',
    description: 'Assign responsibilities clearly so every group member knows what to finish and when.'
  },
  {
    icon: '02',
    title: 'Deadline Reminders',
    description: 'Track approaching due dates and receive timely reminders before work falls behind.'
  },
  {
    icon: '03',
    title: 'Progress Tracking',
    description: 'Monitor completion status across assignments, tasks, and group milestones.'
  }
];

export const benefits = [
  'Reduce missed deadlines across multiple subjects.',
  'Improve group accountability with visible ownership.',
  'Help students balance individual and group workloads.',
  'Give leaders a clear overview of project progress.'
];

export const currentUser = {
  firstName: 'Demo',
  fullName: 'Demo Student'
};

export const groups = [
  { name: 'Data Science Project', members: 5, subject: 'AI & Data Mining', progress: 82 },
  { name: 'Mobile App Team', members: 4, subject: 'Cross Platform', progress: 64 },
  { name: 'Research Writing', members: 3, subject: 'Academic English', progress: 48 }
];

export const tasks = [
  { title: 'Prepare ER diagram', group: 'Data Science Project', status: 'In Progress', due: 'Today', dueOrder: 1 },
  { title: 'Review authentication flow', group: 'Mobile App Team', status: 'Pending', due: 'Tomorrow', dueOrder: 2 },
  { title: 'Finalize literature review', group: 'Research Writing', status: 'Completed', due: 'Jun 5', dueOrder: 3 },
  { title: 'Create dashboard wireframe', group: 'Mobile App Team', status: 'In Progress', due: 'Jun 7', dueOrder: 4 }
];

export const deadlines = [
  { title: 'Database schema submission', date: 'Jun 4', priority: 'High', dueOrder: 1 },
  { title: 'Frontend prototype demo', date: 'Jun 6', priority: 'Medium', dueOrder: 2 },
  { title: 'Final report outline', date: 'Jun 10', priority: 'Medium', dueOrder: 3 },
  { title: 'Group presentation rehearsal', date: 'Jun 12', priority: 'Low', dueOrder: 4 }
];

export const notifications = [
  'A teammate marked "API research" as completed.',
  'Data Science Project deadline is 2 days away.',
  'Instructor feedback was added to Mobile App Team.'
];

export const progressOverview = [
  { title: 'Assignment Completion', value: 72, description: 'Overall progress across active assignments.', color: 'bg-[#073ca6]' },
  { title: 'Group Participation', value: 86, description: 'Members are contributing consistently.', color: 'bg-[#139f98]' },
  { title: 'Deadline Readiness', value: 58, description: 'Several tasks need attention this week.', color: 'bg-[#f59e0b]' }
];

export function buildDashboardStats(groupList, taskList, deadlineList) {
  const completedTasks = taskList.filter((task) => task.status === 'Completed').length;
  const activeTasks = taskList.filter((task) => task.status !== 'Completed').length;

  return [
    { label: 'Total Groups', value: groupList.length, detail: 'active groups', color: 'bg-[#073ca6]' },
    { label: 'Total Tasks', value: taskList.length, detail: `${activeTasks} active`, color: 'bg-[#139f98]' },
    {
      label: 'Completed Tasks',
      value: completedTasks,
      detail: taskList.length ? `${Math.round((completedTasks / taskList.length) * 100)}% done` : '0% done',
      color: 'bg-[#f59e0b]'
    },
    { label: 'Upcoming Deadlines', value: deadlineList.length, detail: 'next 7 days', color: 'bg-[#ef4444]' }
  ];
}

export const workspaceSummary = [
  { label: 'Active Groups', value: groups.length },
  { label: 'Pending Tasks', value: tasks.filter((task) => task.status !== 'Completed').length },
  { label: 'Due Soon', value: deadlines.length },
  { label: 'Team Updates', value: notifications.length }
];

export const workspaceAssignments = [
  {
    title: 'AI Ethics Presentation',
    group: 'Data Science Project',
    owner: 'Team Alpha',
    status: 'In Progress',
    priority: 'High',
    progress: 72
  },
  {
    title: 'Mobile UI Prototype',
    group: 'Mobile App Team',
    owner: 'Design Squad',
    status: 'Review',
    priority: 'Medium',
    progress: 64
  },
  {
    title: 'Research Draft',
    group: 'Research Writing',
    owner: 'Writing Team',
    status: 'Pending',
    priority: 'Medium',
    progress: 45
  }
];

export const workspaceResources = [
  { title: 'Project brief', type: 'Document', updated: 'Updated today' },
  { title: 'Reference slides', type: 'Slides', updated: 'Updated yesterday' },
  { title: 'Meeting notes', type: 'Notes', updated: 'Updated Jun 2' }
];

export const workspaceAnnouncements = [
  'Group leaders should review progress before Friday.',
  'Timeline page now includes presentation rehearsal.',
  'Remember to submit individual reflection notes.'
];

export const leaderMembers = [
  { name: 'Demo Student', role: 'Leader', workload: 86, status: 'Online' },
  { name: 'Nita Chen', role: 'Researcher', workload: 68, status: 'Working' },
  { name: 'Rithy San', role: 'Developer', workload: 74, status: 'Working' },
  { name: 'Mina Sok', role: 'Designer', workload: 52, status: 'Needs Check' }
];

export const leaderTasks = [
  { title: 'Collect survey data', assignee: 'Nita Chen', priority: 'High', status: 'In Progress' },
  { title: 'Build dashboard chart', assignee: 'Rithy San', priority: 'High', status: 'Pending' },
  { title: 'Prepare presentation visuals', assignee: 'Mina Sok', priority: 'Medium', status: 'In Progress' }
];

export const timelineEvents = [
  {
    title: 'Project proposal approved',
    date: 'Jun 1',
    type: 'Milestone',
    group: 'Data Science Project',
    description: 'Topic and project scope approved by instructor.'
  },
  {
    title: 'Database schema submission',
    date: 'Jun 4',
    type: 'Deadline',
    group: 'Data Science Project',
    description: 'Submit ER diagram and initial database tables.'
  },
  {
    title: 'Frontend prototype demo',
    date: 'Jun 6',
    type: 'Presentation',
    group: 'Mobile App Team',
    description: 'Show working navigation and main UI screens.'
  },
  {
    title: 'Final report outline',
    date: 'Jun 10',
    type: 'Deadline',
    group: 'Research Writing',
    description: 'Complete report structure and divide writing tasks.'
  },
  {
    title: 'Group rehearsal',
    date: 'Jun 12',
    type: 'Meeting',
    group: 'All Groups',
    description: 'Practice final presentation and review speaking order.'
  }
];
