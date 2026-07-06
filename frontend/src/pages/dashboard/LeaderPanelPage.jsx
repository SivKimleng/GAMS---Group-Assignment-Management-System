import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardPanel from '../../components/dashboard/DashboardPanel.jsx';
import ProgressCard from '../../components/dashboard/ProgressCard.jsx';
import MobileDashboardNav from '../../components/layouts/MobileDashboardNav.jsx';
import Sidebar from '../../components/layouts/Sidebar.jsx';
import Button from '../../components/ui/Button.jsx';
import { currentUser, leaderMembers, leaderTasks } from '../../data/mockData.js';
import { createTask, getApiErrorMessage, getTasks, updateTaskStatus } from '../../services/api.js';
import { clearMockSession, getMockSession } from '../../utils/mockAuth.js';

const priorities = ['High', 'Medium', 'Low'];

function mapLeaderTask(task) {
  return {
    id: task.task_id,
    assignmentId: task.assignment_id,
    title: task.task_name,
    assignee: task.assigned_user_id ? `User #${task.assigned_user_id}` : 'Unassigned',
    priority: task.priority,
    status: task.status
  };
}

function LeaderPanelPage() {
  const navigate = useNavigate();
  const session = getMockSession();
  const user = session?.user || currentUser;
  const [tasks, setTasks] = useState(leaderTasks);
  const [draftTask, setDraftTask] = useState({
    title: '',
    assignee: leaderMembers[1].name,
    priority: 'Medium'
  });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadTasks() {
      if (!localStorage.getItem('token') && !sessionStorage.getItem('token')) {
        return;
      }

      try {
        const response = await getTasks();

        if (!isActive) return;

        setTasks(response.data.map(mapLeaderTask));
      } catch (error) {
        if (isActive) {
          setNotice(getApiErrorMessage(error, 'Could not load backend tasks. Showing demo data.'));
        }
      }
    }

    loadTasks();

    return () => {
      isActive = false;
    };
  }, []);

  const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const pendingTasks = tasks.filter((task) => task.status !== 'Completed').length;

  const priorityCounts = useMemo(
    () =>
      priorities.map((priority) => ({
        title: `${priority} Priority`,
        value: tasks.filter((task) => task.priority === priority).length,
        color: priority === 'High' ? 'bg-red-500' : priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
      })),
    [tasks]
  );

  async function handleAddTask(event) {
    event.preventDefault();
    const title = draftTask.title.trim();
    if (!title) return;

    const assignmentId = tasks.find((task) => task.assignmentId)?.assignmentId;

    if (assignmentId) {
      try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        const response = await createTask({
          assignment_id: assignmentId,
          task_name: title,
          priority: draftTask.priority,
          status: 'Pending',
          due_date: dueDate.toISOString().slice(0, 10)
        });
        setTasks([mapLeaderTask(response.data), ...tasks]);
        setDraftTask({ title: '', assignee: draftTask.assignee, priority: 'Medium' });
        return;
      } catch (error) {
        setNotice(getApiErrorMessage(error, 'Could not create task.'));
        return;
      }
    }

    setTasks([
      {
        title,
        assignee: draftTask.assignee,
        priority: draftTask.priority,
        status: 'Pending'
      },
      ...tasks
    ]);
    setDraftTask({ title: '', assignee: draftTask.assignee, priority: 'Medium' });
  }

  async function handleCompleteTask(taskToUpdate) {
    const nextStatus = taskToUpdate.status === 'Completed' ? 'In Progress' : 'Completed';

    if (taskToUpdate.id) {
      try {
        const response = await updateTaskStatus(taskToUpdate.id, nextStatus);
        const updatedTask = mapLeaderTask(response.data);
        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === taskToUpdate.id ? updatedTask : task))
        );
        return;
      } catch (error) {
        setNotice(getApiErrorMessage(error, 'Could not update task status.'));
        return;
      }
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.title === taskToUpdate.title
          ? { ...task, status: nextStatus }
          : task
      )
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
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#139f98]">Leader Panel</p>
              <h1 className="text-xl font-black text-slate-950">Group Leader Tools</h1>
            </div>
            <Button to="/workspace" variant="secondary" className="min-h-10 px-4">
              Workspace
            </Button>
          </div>
          <MobileDashboardNav />
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg bg-[#073ca6] p-6 text-white">
              <p className="text-sm font-bold text-blue-100">Leader overview</p>
              <h2 className="mt-2 text-3xl font-black">Keep the team balanced and accountable.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                Assign tasks, check workloads, and mark responsibilities complete using mock frontend state.
              </p>
            </div>
            <DashboardPanel title="Completion Rate" action={`${completedTasks}/${tasks.length}`}>
              <ProgressCard
                title="Leader Task Progress"
                value={progress}
                description={`${pendingTasks} task${pendingTasks === 1 ? '' : 's'} still need leader attention.`}
              />
            </DashboardPanel>
          </section>

          {notice && (
            <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
              <span>{notice}</span>
              <button type="button" className="font-black text-teal-900" onClick={() => setNotice('')}>
                Dismiss
              </button>
            </div>
          )}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <DashboardPanel title="Assign New Task">
              <form onSubmit={handleAddTask} className="grid gap-4">
                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Task Name</span>
                  <input
                    value={draftTask.title}
                    onChange={(event) => setDraftTask({ ...draftTask, title: event.target.value })}
                    placeholder="Example: Review final slides"
                    className="focus-ring h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">Assignee</span>
                    <select
                      value={draftTask.assignee}
                      onChange={(event) => setDraftTask({ ...draftTask, assignee: event.target.value })}
                      className="focus-ring h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                    >
                      {leaderMembers.map((member) => (
                        <option key={member.name} value={member.name}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">Priority</span>
                    <select
                      value={draftTask.priority}
                      onChange={(event) => setDraftTask({ ...draftTask, priority: event.target.value })}
                      className="focus-ring h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                    >
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <Button type="submit" className="w-full">
                  Assign Task
                </Button>
              </form>
            </DashboardPanel>

            <DashboardPanel title="Contribution Status">
              <div className="grid gap-3">
                {leaderMembers.map((member) => (
                  <article key={member.name} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black text-slate-950">{member.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{member.role}</p>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                        {member.status}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#139f98]" style={{ width: `${member.workload}%` }} />
                    </div>
                  </article>
                ))}
              </div>
            </DashboardPanel>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <DashboardPanel title="Leader Tasks" action="Click status to update">
              <div className="overflow-hidden rounded-lg border border-slate-200">
                {tasks.map((task, index) => (
                  <div
                    key={`${task.title}-${task.assignee}`}
                    className={`grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center ${
                      index > 0 ? 'border-t border-slate-200' : ''
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-black text-slate-950">{task.title}</h3>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{task.assignee}</p>
                    </div>
                    <span className="w-fit rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                      {task.priority}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCompleteTask(task)}
                      className={`w-fit rounded-md px-2 py-1 text-xs font-black ${
                        task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {task.status}
                    </button>
                    <span className="text-sm font-bold text-slate-500">{task.id ? 'API' : 'Mock'}</span>
                  </div>
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel title="Priority Mix">
              <div className="grid gap-3">
                {priorityCounts.map((item) => (
                  <article key={item.title} className="rounded-lg bg-slate-50 p-4">
                    <div className={`mb-3 h-1.5 w-12 rounded-full ${item.color}`} />
                    <p className="text-sm font-black text-slate-950">{item.title}</p>
                    <strong className="mt-2 block text-2xl font-black text-slate-800">{item.value}</strong>
                  </article>
                ))}
              </div>
            </DashboardPanel>
          </section>
        </div>
      </main>
    </div>
  );
}

export default LeaderPanelPage;
