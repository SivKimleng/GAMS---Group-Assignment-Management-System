import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardPanel from '../../components/dashboard/DashboardPanel.jsx';
import ProgressCard from '../../components/dashboard/ProgressCard.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import MobileDashboardNav from '../../components/layouts/MobileDashboardNav.jsx';
import Sidebar from '../../components/layouts/Sidebar.jsx';
import Button from '../../components/ui/Button.jsx';
import {
  buildDashboardStats,
  currentUser,
  deadlines as initialDeadlines,
  groups as initialGroups,
  notifications,
  progressOverview,
  tasks as initialTasks
} from '../../data/mockData.js';
import { clearMockSession, getMockSession } from '../../utils/mockAuth.js';

const statusClasses = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700'
};

function DashboardPage() {
  const navigate = useNavigate();
  const session = getMockSession();
  const user = session?.user || currentUser;
  const [groups, setGroups] = useState(initialGroups);
  const [tasks, setTasks] = useState(initialTasks);
  const [deadlines] = useState(initialDeadlines);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortTasksByDueDate, setSortTasksByDueDate] = useState(false);
  const [notice, setNotice] = useState('');

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const visibleGroups = useMemo(() => {
    if (!normalizedSearch) return groups;
    return groups.filter((group) =>
      `${group.name} ${group.subject}`.toLowerCase().includes(normalizedSearch)
    );
  }, [groups, normalizedSearch]);

  const visibleTasks = useMemo(() => {
    const filteredTasks = normalizedSearch
      ? tasks.filter((task) => `${task.title} ${task.group} ${task.status}`.toLowerCase().includes(normalizedSearch))
      : tasks;

    if (!sortTasksByDueDate) return filteredTasks;
    return [...filteredTasks].sort((firstTask, secondTask) => firstTask.dueOrder - secondTask.dueOrder);
  }, [normalizedSearch, sortTasksByDueDate, tasks]);

  const visibleDeadlines = useMemo(() => {
    if (!normalizedSearch) return deadlines;
    return deadlines.filter((deadline) =>
      `${deadline.title} ${deadline.priority} ${deadline.date}`.toLowerCase().includes(normalizedSearch)
    );
  }, [deadlines, normalizedSearch]);

  const stats = buildDashboardStats(groups, tasks, deadlines);

  function handleCreateGroup() {
    const nextNumber = groups.length + 1;
    const newGroup = {
      name: `Demo Group ${nextNumber}`,
      members: 1,
      subject: 'New Assignment',
      progress: 0
    };

    setGroups([newGroup, ...groups]);
    setNotice(`${newGroup.name} added to My Groups.`);
  }

  function handleToggleTaskStatus(title) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.title !== title) return task;
        return {
          ...task,
          status: task.status === 'Completed' ? 'In Progress' : 'Completed'
        };
      })
    );
  }

  function handleLogout() {
    clearMockSession();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] lg:flex">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#139f98]">Dashboard</p>
              <h1 className="text-xl font-black text-slate-950">GAMS Workspace</h1>
            </div>
            <label className="hidden w-full max-w-sm md:block">
              <span className="sr-only">Search tasks, groups, deadlines</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tasks, groups, deadlines..."
                className="focus-ring h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 placeholder:text-slate-400"
              />
            </label>
          </div>
          <MobileDashboardNav />
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <section className="mb-6 rounded-lg bg-[#073ca6] p-6 text-white">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold text-blue-100">Welcome back, {user.firstName}</p>
                <h2 className="mt-2 text-3xl font-black">You have {deadlines.length} deadlines coming up.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                  Review your active groups, finish high-priority tasks, and keep your team aligned before submission week.
                </p>
              </div>
              <Button type="button" variant="light" className="self-start" onClick={handleCreateGroup}>
                New Group
              </Button>
            </div>
          </section>

          <label className="mb-6 block md:hidden">
            <span className="sr-only">Search dashboard</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search dashboard..."
              className="focus-ring h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
            />
          </label>

          {notice && (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
              <span>{notice}</span>
              <button type="button" className="font-black text-teal-900" onClick={() => setNotice('')}>
                Dismiss
              </button>
            </div>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <div className="grid gap-6">
              <DashboardPanel title="My Groups" action="View all">
                <div className="grid gap-3">
                  {visibleGroups.map((group) => (
                    <article key={group.name} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black text-slate-950">{group.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{group.subject} - {group.members} members</p>
                        </div>
                        <span className="rounded-md bg-[#e5fbf8] px-2 py-1 text-xs font-black text-[#087a75]">{group.progress}%</span>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#139f98]" style={{ width: `${group.progress}%` }} />
                      </div>
                    </article>
                  ))}
                  {visibleGroups.length === 0 && (
                    <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">No groups match your search.</p>
                  )}
                </div>
              </DashboardPanel>

              <DashboardPanel
                title="Recent Tasks"
                action={
                  <button type="button" onClick={() => setSortTasksByDueDate((current) => !current)}>
                    {sortTasksByDueDate ? 'Default order' : 'Sort by due date'}
                  </button>
                }
              >
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  {visibleTasks.map((task, index) => (
                    <div key={task.title} className={`grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center ${index > 0 ? 'border-t border-slate-200' : ''}`}>
                      <div>
                        <h3 className="text-sm font-black text-slate-950">{task.title}</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{task.group}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task.title)}
                        className={`w-fit rounded-md px-2 py-1 text-xs font-black ${statusClasses[task.status]}`}
                      >
                        {task.status}
                      </button>
                      <span className="text-sm font-bold text-slate-600">{task.due}</span>
                    </div>
                  ))}
                  {visibleTasks.length === 0 && (
                    <p className="p-4 text-sm font-semibold text-slate-500">No tasks match your search.</p>
                  )}
                </div>
              </DashboardPanel>
            </div>

            <div className="grid gap-6">
              <DashboardPanel title="Upcoming Deadlines" action="Calendar">
                <div className="grid gap-3">
                  {visibleDeadlines.map((deadline) => (
                    <article key={deadline.title} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-950">{deadline.title}</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{deadline.date}</p>
                      </div>
                      <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-black text-red-700">{deadline.priority}</span>
                    </article>
                  ))}
                  {visibleDeadlines.length === 0 && (
                    <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">No deadlines match your search.</p>
                  )}
                </div>
              </DashboardPanel>

              <DashboardPanel title="Notifications" action={`${notifications.length} new`}>
                <div className="grid gap-3">
                  {notifications.map((notification) => (
                    <p key={notification} className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-semibold leading-6 text-slate-600">
                      {notification}
                    </p>
                  ))}
                </div>
              </DashboardPanel>

              <DashboardPanel title="Progress Overview">
                <div className="grid gap-3">
                  {progressOverview.map((item) => (
                    <ProgressCard key={item.title} {...item} />
                  ))}
                </div>
              </DashboardPanel>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
