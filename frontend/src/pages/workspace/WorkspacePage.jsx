import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardPanel from '../../components/dashboard/DashboardPanel.jsx';
import MobileDashboardNav from '../../components/layouts/MobileDashboardNav.jsx';
import Sidebar from '../../components/layouts/Sidebar.jsx';
import Button from '../../components/ui/Button.jsx';
import {
  currentUser,
  workspaceAnnouncements,
  workspaceAssignments,
  workspaceResources,
  workspaceSummary
} from '../../data/mockData.js';
import { clearMockSession, getMockSession } from '../../utils/mockAuth.js';

const statusStyles = {
  'In Progress': 'bg-blue-100 text-blue-700',
  Review: 'bg-purple-100 text-purple-700',
  Pending: 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700'
};

function WorkspacePage() {
  const navigate = useNavigate();
  const session = getMockSession();
  const user = session?.user || currentUser;
  const [assignments, setAssignments] = useState(workspaceAssignments);
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [activityLog, setActivityLog] = useState(['Workspace opened with current mock assignments.']);

  const visibleAssignments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const matchesStatus = statusFilter === 'All' || assignment.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        `${assignment.title} ${assignment.group} ${assignment.owner}`.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [assignments, query, statusFilter]);

  const completedCount = assignments.filter((assignment) => assignment.status === 'Completed').length;
  const averageProgress = Math.round(
    assignments.reduce((total, assignment) => total + assignment.progress, 0) / assignments.length
  );

  function handleCompleteAssignment(title) {
    setAssignments((currentAssignments) =>
      currentAssignments.map((assignment) =>
        assignment.title === title ? { ...assignment, status: 'Completed', progress: 100 } : assignment
      )
    );
    setActivityLog((currentLog) => [`${title} marked as completed.`, ...currentLog].slice(0, 4));
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
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#139f98]">Workspace</p>
              <h1 className="text-xl font-black text-slate-950">Project Workspace</h1>
            </div>
            <Button to="/dashboard" variant="secondary" className="min-h-10 px-4">
              Dashboard
            </Button>
          </div>
          <MobileDashboardNav />
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold text-[#139f98]">Shared academic command center</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Manage all active project work.</h2>
              </div>
              <label className="w-full lg:max-w-sm">
                <span className="sr-only">Search workspace</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search assignment, group, owner..."
                  className="focus-ring h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {workspaceSummary.map((item) => (
                <article key={item.label} className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase text-slate-500">{item.label}</p>
                  <strong className="mt-2 block text-2xl font-black text-slate-950">{item.value}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <DashboardPanel
              title="Current Assignments"
              action={`${completedCount}/${assignments.length} completed`}
            >
              <div className="mb-4 flex flex-wrap gap-2">
                {['All', 'In Progress', 'Review', 'Pending', 'Completed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-md px-3 py-2 text-sm font-bold ${
                      statusFilter === status ? 'bg-[#073ca6] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="grid gap-3">
                {visibleAssignments.map((assignment) => (
                  <article key={assignment.title} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-black text-slate-950">{assignment.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {assignment.group} - {assignment.owner}
                        </p>
                      </div>
                      <span className={`w-fit rounded-md px-2 py-1 text-xs font-black ${statusStyles[assignment.status]}`}>
                        {assignment.status}
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#139f98]" style={{ width: `${assignment.progress}%` }} />
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-slate-600">{assignment.progress}% progress</span>
                      <button
                        type="button"
                        onClick={() => handleCompleteAssignment(assignment.title)}
                        disabled={assignment.status === 'Completed'}
                        className="rounded-md bg-[#073ca6] px-3 py-2 text-sm font-bold text-white disabled:bg-slate-300"
                      >
                        Mark Complete
                      </button>
                    </div>
                  </article>
                ))}

                {visibleAssignments.length === 0 && (
                  <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                    No assignments match the current workspace filter.
                  </p>
                )}
              </div>
            </DashboardPanel>

            <div className="grid gap-6">
              <DashboardPanel title="Workspace Health" action={`${averageProgress}% avg`}>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#073ca6]" style={{ width: `${averageProgress}%` }} />
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  Overall progress is calculated from the active mock assignments shown in this workspace.
                </p>
              </DashboardPanel>

              <DashboardPanel title="Resources">
                <div className="grid gap-3">
                  {workspaceResources.map((resource) => (
                    <article key={resource.title} className="rounded-lg bg-slate-50 p-4">
                      <p className="font-black text-slate-950">{resource.title}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {resource.type} - {resource.updated}
                      </p>
                    </article>
                  ))}
                </div>
              </DashboardPanel>

              <DashboardPanel title="Activity">
                <div className="grid gap-2">
                  {[...activityLog, ...workspaceAnnouncements].slice(0, 5).map((item) => (
                    <p key={item} className="rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-600">
                      {item}
                    </p>
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

export default WorkspacePage;
