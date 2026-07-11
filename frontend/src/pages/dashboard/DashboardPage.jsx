import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardPanel from '../../components/dashboard/DashboardPanel.jsx';
import ProgressCard from '../../components/dashboard/ProgressCard.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import MobileDashboardNav from '../../components/layouts/MobileDashboardNav.jsx';
import Sidebar from '../../components/layouts/Sidebar.jsx';
import Button from '../../components/ui/Button.jsx';
import {
  buildDashboardStats,
  buildDeadlines,
  buildNotifications,
  buildProgressOverview,
  formatUser,
  hasAuthToken,
  mapGroupwork,
  mapTask,
  SELECTED_GROUPWORK_STORAGE_KEY,
  uniqueAssignments,
  uniqueGroupworks,
  uniqueTasks
} from '../../utils/dataMappers.js';
import {
  createGroupwork,
  getApiErrorMessage,
  getAssignments,
  getGroupworks,
  getReminders,
  getTasks,
  joinGroupworkByCode,
  markReminderRead,
  updateTaskStatus
} from '../../services/api.js';
import { clearSession, getSession } from '../../utils/authSession.js';

const statusClasses = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Review: 'bg-purple-100 text-purple-700'
};

function DashboardPage() {
  const navigate = useNavigate();
  const session = getSession();
  const user = formatUser(session?.user);
  const [groups, setGroups] = useState([]);
  const [rawAssignments, setRawAssignments] = useState([]);
  const [rawTasks, setRawTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortTasksByDueDate, setSortTasksByDueDate] = useState(false);
  const [notice, setNotice] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [draftGroup, setDraftGroup] = useState({
    name: '',
    subject: '',
    description: ''
  });
  const [createdGroup, setCreatedGroup] = useState(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const groupFormRef = useRef(null);

  useEffect(() => {
    let isActive = true;

    async function loadDashboardData() {
      if (!hasAuthToken()) {
        setIsLoading(false);
        setNotice('Please login to load your dashboard data from the backend.');
        return;
      }

      try {
        const [groupworkResponse, assignmentResponse, taskResponse, reminderResponse] = await Promise.all([
          getGroupworks(),
          getAssignments(),
          getTasks(),
          getReminders()
        ]);

        if (!isActive) return;

        const nextGroupworks = uniqueGroupworks(groupworkResponse.data);
        const nextAssignments = uniqueAssignments(assignmentResponse.data);
        const nextTasks = uniqueTasks(taskResponse.data);

        setRawAssignments(nextAssignments);
        setRawTasks(nextTasks);
        setGroups(nextGroupworks.map((groupwork) => mapGroupwork(groupwork, nextAssignments, nextTasks)));
        setTasks(nextTasks.map(mapTask));
        setReminders(reminderResponse.data);
      } catch (error) {
        if (isActive) {
          setNotice(getApiErrorMessage(error, 'Could not load backend dashboard data.'));
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isActive = false;
    };
  }, []);

  async function refreshDashboardData() {
    const [groupworkResponse, assignmentResponse, taskResponse, reminderResponse] = await Promise.all([
      getGroupworks(),
      getAssignments(),
      getTasks(),
      getReminders()
    ]);

    const nextGroupworks = uniqueGroupworks(groupworkResponse.data);
    const nextAssignments = uniqueAssignments(assignmentResponse.data);
    const nextTasks = uniqueTasks(taskResponse.data);
    const nextGroups = nextGroupworks.map((groupwork) => mapGroupwork(groupwork, nextAssignments, nextTasks));

    setRawAssignments(nextAssignments);
    setRawTasks(nextTasks);
    setGroups(nextGroups);
    setTasks(nextTasks.map(mapTask));
    setReminders(reminderResponse.data);

    return {
      groupworks: nextGroupworks,
      assignments: nextAssignments,
      tasks: nextTasks,
      groups: nextGroups
    };
  }

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

  const deadlines = useMemo(() => buildDeadlines(rawAssignments, rawTasks), [rawAssignments, rawTasks]);

  const visibleDeadlines = useMemo(() => {
    if (!normalizedSearch) return deadlines;
    return deadlines.filter((deadline) =>
      `${deadline.title} ${deadline.priority} ${deadline.date}`.toLowerCase().includes(normalizedSearch)
    );
  }, [deadlines, normalizedSearch]);

  const notifications = useMemo(() => buildNotifications(rawTasks, deadlines), [deadlines, rawTasks]);
  const progressOverview = useMemo(
    () => buildProgressOverview(rawAssignments, rawTasks, deadlines),
    [deadlines, rawAssignments, rawTasks]
  );
  const stats = buildDashboardStats(groups, tasks, deadlines);

  async function handleCreateGroup(event) {
    event.preventDefault();
    const groupName = draftGroup.name.trim();
    const subject = draftGroup.subject.trim();

    if (!groupName || !subject) {
      setNotice('Group name and subject are required.');
      return;
    }

    setIsCreatingGroup(true);

    try {
      const response = await createGroupwork({
        groupwork_name: groupName,
        subject,
        description: draftGroup.description.trim()
      });
      const refreshedData = await refreshDashboardData();
      const newGroup = mapGroupwork(response.data, refreshedData.assignments, refreshedData.tasks);
      sessionStorage.setItem(SELECTED_GROUPWORK_STORAGE_KEY, String(newGroup.id));
      setCreatedGroup({
        ...newGroup,
        leaderName: user.fullName,
        role: 'Leader'
      });
      setDraftGroup({ name: '', subject: '', description: '' });
      setNotice('Group created successfully.');
    } catch (error) {
      setNotice(getApiErrorMessage(error, 'Could not create groupwork.'));
    } finally {
      setIsCreatingGroup(false);
    }
  }

  function handleShowCreateGroup() {
    groupFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    groupFormRef.current?.querySelector('input')?.focus();
  }

  async function handleCopyGroupCode(groupCode) {
    if (!groupCode) {
      setNotice('This group does not have a shareable code yet.');
      return;
    }

    try {
      await navigator.clipboard.writeText(groupCode);
      setNotice('Group code copied to clipboard.');
    } catch {
      setNotice(`Group code: ${groupCode}`);
    }
  }

  async function handleCopyInvite(group) {
    const inviteText = group.code
      ? `Join my GAMS group "${group.name}" with code ${group.code}.`
      : `Join my GAMS group "${group.name}".`;

    try {
      await navigator.clipboard.writeText(inviteText);
      setNotice('Invite message copied to clipboard.');
    } catch {
      setNotice(inviteText);
    }
  }

  async function handleJoinGroup(event) {
    event.preventDefault();
    const code = joinCode.trim();

    if (!code) {
      setNotice('Enter a group code before joining.');
      return;
    }

    setIsJoining(true);

    try {
      const response = await joinGroupworkByCode(code);
      await refreshDashboardData();
      setJoinCode('');
      setNotice(`Joined ${response.data.groupwork_name} successfully.`);
    } catch (error) {
      setNotice(getApiErrorMessage(error, 'Could not join groupwork with that code.'));
    } finally {
      setIsJoining(false);
    }
  }

  async function handleMarkReminderRead(reminderId) {
    try {
      const response = await markReminderRead(reminderId);
      setReminders((currentReminders) =>
        currentReminders.map((reminder) =>
          reminder.reminder_id === reminderId ? response.data : reminder
        )
      );
      setNotice('Reminder marked as read.');
    } catch (error) {
      setNotice(getApiErrorMessage(error, 'Could not update reminder.'));
    }
  }

  async function handleToggleTaskStatus(taskToUpdate) {
    const nextStatus = taskToUpdate.status === 'Completed' ? 'In Progress' : 'Completed';

    if (taskToUpdate.id) {
      try {
        const response = await updateTaskStatus(taskToUpdate.id, nextStatus);
        const updatedTask = mapTask(response.data);
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === taskToUpdate.id ? updatedTask : task))
        );
        setRawTasks((currentTasks) =>
          currentTasks.map((task) => (task.task_id === taskToUpdate.id ? response.data : task))
        );
        return;
      } catch (error) {
        setNotice(getApiErrorMessage(error, 'Could not update task status.'));
        return;
      }
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.title !== taskToUpdate.title) return task;
        return {
          ...task,
          status: nextStatus
        };
      })
    );
  }

  function handleLogout() {
    clearSession();
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
              <Button type="button" variant="light" className="self-start" onClick={handleShowCreateGroup}>
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

          {isLoading && (
            <p className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
              Loading dashboard data from backend...
            </p>
          )}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <div className="grid gap-6">
              <DashboardPanel title="My Groups" action="View all">
                <form
                  ref={groupFormRef}
                  onSubmit={handleCreateGroup}
                  className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-sm font-bold text-slate-700">Group Name</span>
                      <input
                        value={draftGroup.name}
                        onChange={(event) => setDraftGroup({ ...draftGroup, name: event.target.value })}
                        placeholder="Example: Capstone Team"
                        className="focus-ring h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                      />
                    </label>
                    <label>
                      <span className="mb-2 block text-sm font-bold text-slate-700">Subject</span>
                      <input
                        value={draftGroup.subject}
                        onChange={(event) => setDraftGroup({ ...draftGroup, subject: event.target.value })}
                        placeholder="Example: Cross Project"
                        className="focus-ring h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                      />
                    </label>
                  </div>
                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">Description</span>
                    <textarea
                      value={draftGroup.description}
                      onChange={(event) => setDraftGroup({ ...draftGroup, description: event.target.value })}
                      placeholder="Optional group notes"
                      rows={2}
                      className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <Button type="submit" className="w-full sm:w-fit" disabled={isCreatingGroup}>
                    {isCreatingGroup ? 'Creating...' : 'Create Group'}
                  </Button>
                </form>

                {createdGroup && (
                  <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Group created successfully</p>
                        <h3 className="mt-1 text-lg font-black text-slate-950">{createdGroup.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {createdGroup.subject} - {createdGroup.members} member{createdGroup.members === 1 ? '' : 's'}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          Group code: <span className="font-black text-slate-950">{createdGroup.code || 'Not available'}</span>
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {createdGroup.role}: {createdGroup.leaderName}
                        </p>
                      </div>
                      <span className="w-fit rounded-md bg-white px-2 py-1 text-xs font-black text-teal-700 ring-1 ring-teal-200">
                        Ready
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button to={`/groups/${createdGroup.id}`} className="px-4">
                        Open Group Workspace
                      </Button>
                      <Button to={`/groups/${createdGroup.id}`} variant="secondary" className="px-4">
                        Leader Panel
                      </Button>
                      <Button type="button" variant="secondary" className="px-4" onClick={() => handleCopyGroupCode(createdGroup.code)}>
                        Copy Group Code
                      </Button>
                      <Button type="button" variant="secondary" className="px-4" onClick={() => handleCopyInvite(createdGroup)}>
                        Invite Members
                      </Button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleJoinGroup} className="mb-4 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_auto]">
                  <label>
                    <span className="sr-only">Group code</span>
                    <input
                      value={joinCode}
                      onChange={(event) => setJoinCode(event.target.value)}
                      placeholder="Enter group code"
                      className="focus-ring h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                    />
                  </label>
                  <Button type="submit" className="min-h-11 px-4" disabled={isJoining}>
                    {isJoining ? 'Joining...' : 'Join Group'}
                  </Button>
                </form>
                <div className="grid gap-3">
                  {visibleGroups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        sessionStorage.setItem(SELECTED_GROUPWORK_STORAGE_KEY, String(group.id));
                        navigate(`/groups/${group.id}`);
                      }}
                      className="w-full rounded-lg border border-slate-200 p-4 text-left transition hover:border-[#139f98] hover:bg-teal-50"
                      aria-label={`Open ${group.name}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-black text-slate-950">{group.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {group.subject} - {group.members} member{group.members === 1 ? '' : 's'} - {group.assignmentCount} assignment{group.assignmentCount === 1 ? '' : 's'}
                          </p>
                        </div>
                        <span className="rounded-md bg-[#e5fbf8] px-2 py-1 text-xs font-black text-[#087a75]">{group.progress}%</span>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#139f98]" style={{ width: `${group.progress}%` }} />
                      </div>
                    </button>
                  ))}
                  {visibleGroups.length === 0 && (
                    <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                      {normalizedSearch ? 'No groups match your search.' : 'No groups yet. Create or join a group to get started.'}
                    </p>
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
                    <div key={task.id} className={`grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center ${index > 0 ? 'border-t border-slate-200' : ''}`}>
                      <div>
                        <h3 className="text-sm font-black text-slate-950">{task.title}</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{task.group}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`w-fit rounded-md px-2 py-1 text-xs font-black ${statusClasses[task.status]}`}
                      >
                        {task.status}
                      </button>
                      <span className="text-sm font-bold text-slate-600">{task.due}</span>
                    </div>
                  ))}
                  {visibleTasks.length === 0 && (
                    <p className="p-4 text-sm font-semibold text-slate-500">
                      {normalizedSearch ? 'No tasks match your search.' : 'No tasks found in the database yet.'}
                    </p>
                  )}
                </div>
              </DashboardPanel>
            </div>

            <div className="grid gap-6">
              <DashboardPanel title="Reminders" action={`${reminders.filter((reminder) => !reminder.is_read).length} unread`}>
                <div className="grid gap-3">
                  {reminders.slice(0, 5).map((reminder) => (
                    <article
                      key={reminder.reminder_id}
                      className={`rounded-lg border p-4 ${
                        reminder.is_read ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-black text-slate-950">{reminder.reminder_message}</h3>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {reminder.assignment_name || reminder.task_name || 'Reminder'} - {new Date(reminder.reminder_date).toLocaleDateString()}
                          </p>
                        </div>
                        {!reminder.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkReminderRead(reminder.reminder_id)}
                            className="w-fit rounded-md bg-white px-2 py-1 text-xs font-black text-[#073ca6] ring-1 ring-slate-200"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                  {reminders.length === 0 && (
                    <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                      No reminders found in the database yet.
                    </p>
                  )}
                </div>
              </DashboardPanel>

              <DashboardPanel title="Upcoming Deadlines" action="Calendar">
                <div className="grid gap-3">
                  {visibleDeadlines.map((deadline) => (
                    <article key={deadline.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-4">
                      <div>
                        <h3 className="text-sm font-black text-slate-950">{deadline.title}</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{deadline.date}</p>
                      </div>
                      <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-black text-red-700">{deadline.priority}</span>
                    </article>
                  ))}
                  {visibleDeadlines.length === 0 && (
                    <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                      {normalizedSearch ? 'No deadlines match your search.' : 'No deadlines found in the database yet.'}
                    </p>
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
                  {notifications.length === 0 && (
                    <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                      No backend notifications to show yet.
                    </p>
                  )}
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
