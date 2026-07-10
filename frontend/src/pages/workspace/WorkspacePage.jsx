import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardPanel from '../../components/dashboard/DashboardPanel.jsx';
import MobileDashboardNav from '../../components/layouts/MobileDashboardNav.jsx';
import Sidebar from '../../components/layouts/Sidebar.jsx';
import Button from '../../components/ui/Button.jsx';
import {
  buildDeadlines,
  buildWorkspaceSummary,
  formatUser,
  hasAuthToken,
  mapAssignment,
  mapGroupwork,
  SELECTED_GROUPWORK_STORAGE_KEY,
  uniqueAssignments,
  uniqueGroupworks,
  uniqueTasks
} from '../../utils/dataMappers.js';
import {
  createAssignment,
  createReminder,
  getApiErrorMessage,
  getAssignments,
  getGroupworks,
  getTasks,
  updateAssignment
} from '../../services/api.js';
import { clearSession, getSession } from '../../utils/authSession.js';

const statusStyles = {
  'In Progress': 'bg-blue-100 text-blue-700',
  Pending: 'bg-amber-100 text-amber-700',
  Review: 'bg-purple-100 text-purple-700',
  Completed: 'bg-emerald-100 text-emerald-700'
};

const priorities = ['Low', 'Medium', 'High'];

function WorkspacePage() {
  const navigate = useNavigate();
  const session = getSession();
  const user = formatUser(session?.user);
  const [groups, setGroups] = useState([]);
  const [rawAssignments, setRawAssignments] = useState([]);
  const [rawTasks, setRawTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [draftAssignment, setDraftAssignment] = useState({
    groupworkId: '',
    name: '',
    description: '',
    deadline: '',
    priority: 'Medium',
    createReminder: true
  });
  const [createdAssignment, setCreatedAssignment] = useState(null);
  const assignmentFormRef = useRef(null);

  useEffect(() => {
    let isActive = true;

    async function loadWorkspaceData() {
      if (!hasAuthToken()) {
        setIsLoading(false);
        setActivityLog(['Please login to load workspace data from the backend.']);
        return;
      }

      try {
        const [groupworkResponse, assignmentResponse, taskResponse] = await Promise.all([
          getGroupworks(),
          getAssignments(),
          getTasks()
        ]);

        if (!isActive) return;

        const nextGroupworks = uniqueGroupworks(groupworkResponse.data);
        const nextAssignments = uniqueAssignments(assignmentResponse.data);
        const nextTasks = uniqueTasks(taskResponse.data);
        const nextGroups = nextGroupworks.map((groupwork) => mapGroupwork(groupwork, nextAssignments, nextTasks));
        const preferredGroupworkId = sessionStorage.getItem(SELECTED_GROUPWORK_STORAGE_KEY) || '';

        setRawAssignments(nextAssignments);
        setRawTasks(nextTasks);
        setAssignments(nextAssignments.map((assignment) => mapAssignment(assignment, nextTasks)));
        setGroups(nextGroups);
        setDraftAssignment((currentDraft) => ({
          ...currentDraft,
          groupworkId: getValidGroupworkId(nextGroups, preferredGroupworkId || currentDraft.groupworkId)
        }));
        setActivityLog(['Workspace data loaded from backend.']);
      } catch (error) {
        if (isActive) {
          setActivityLog([getApiErrorMessage(error, 'Could not load backend workspace data.')]);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadWorkspaceData();

    return () => {
      isActive = false;
    };
  }, []);

  function getValidGroupworkId(groupList, requestedGroupworkId) {
    const requestedId = requestedGroupworkId ? String(requestedGroupworkId) : '';
    if (requestedId && groupList.some((group) => String(group.id) === requestedId)) {
      return requestedId;
    }

    return groupList[0]?.id ? String(groupList[0].id) : '';
  }

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

  const deadlines = useMemo(() => buildDeadlines(rawAssignments, rawTasks), [rawAssignments, rawTasks]);
  const workspaceSummary = useMemo(
    () => buildWorkspaceSummary(groups, rawAssignments, rawTasks, deadlines),
    [deadlines, groups, rawAssignments, rawTasks]
  );
  const completedCount = assignments.filter((assignment) => assignment.status === 'Completed').length;
  const averageProgress = assignments.length
    ? Math.round(assignments.reduce((total, assignment) => total + assignment.progress, 0) / assignments.length)
    : 0;

  async function handleCompleteAssignment(assignmentToUpdate) {
    try {
      const response = await updateAssignment(assignmentToUpdate.id, { status: 'Completed' });
      setRawAssignments((currentAssignments) =>
        currentAssignments.map((assignment) =>
          assignment.assignment_id === assignmentToUpdate.id ? response.data : assignment
        )
      );
      setAssignments((currentAssignments) =>
        currentAssignments.map((assignment) =>
          assignment.id === assignmentToUpdate.id ? mapAssignment(response.data, rawTasks) : assignment
        )
      );
      setActivityLog((currentLog) => [`${assignmentToUpdate.title} marked as completed.`, ...currentLog].slice(0, 5));
    } catch (error) {
      setActivityLog((currentLog) =>
        [getApiErrorMessage(error, 'Could not update assignment status.'), ...currentLog].slice(0, 5)
      );
    }
  }

  async function handleCreateAssignment(event) {
    event.preventDefault();
    const assignmentName = draftAssignment.name.trim();

    if (!groups.length) {
      setActivityLog((currentLog) =>
        ['Please create or join a group before creating assignments.', ...currentLog].slice(0, 5)
      );
      return;
    }

    const groupworkId = getValidGroupworkId(groups, draftAssignment.groupworkId);

    if (!groupworkId) {
      setActivityLog((currentLog) => ['Select a group before creating an assignment.', ...currentLog].slice(0, 5));
      return;
    }

    if (!assignmentName || !draftAssignment.deadline) {
      setActivityLog((currentLog) => ['Assignment name and deadline are required.', ...currentLog].slice(0, 5));
      return;
    }

    setIsCreatingAssignment(true);

    try {
      const response = await createAssignment({
        groupwork_id: groupworkId,
        assignment_name: assignmentName,
        deadline: draftAssignment.deadline,
        assignment_description: draftAssignment.description.trim(),
        priority: draftAssignment.priority
      });

      const nextRawAssignments = uniqueAssignments([response.data, ...rawAssignments]);
      setRawAssignments(nextRawAssignments);
      setAssignments(nextRawAssignments.map((assignment) => mapAssignment(assignment, rawTasks)));
      sessionStorage.setItem(SELECTED_GROUPWORK_STORAGE_KEY, String(groupworkId));
      setCreatedAssignment({
        id: response.data.assignment_id,
        name: response.data.assignment_name,
        groupName: response.data.groupwork_name || groups.find((group) => String(group.id) === String(groupworkId))?.name || 'Selected group',
        deadline: response.data.deadline || draftAssignment.deadline
      });

      if (draftAssignment.createReminder) {
        try {
          await createReminder({
            assignment_id: response.data.assignment_id,
            reminder_message: `Deadline reminder: ${response.data.assignment_name}`,
            reminder_date: `${draftAssignment.deadline} 09:00:00`
          });
        } catch (error) {
          setActivityLog((currentLog) =>
            [getApiErrorMessage(error, 'Assignment created, but reminder creation failed.'), ...currentLog].slice(0, 5)
          );
        }
      }

      setDraftAssignment({
        groupworkId,
        name: '',
        description: '',
        deadline: '',
        priority: 'Medium',
        createReminder: true
      });
      setActivityLog((currentLog) => [`${response.data.assignment_name} created.`, ...currentLog].slice(0, 5));
    } catch (error) {
      setActivityLog((currentLog) =>
        [getApiErrorMessage(error, 'Could not create assignment.'), ...currentLog].slice(0, 5)
      );
    } finally {
      setIsCreatingAssignment(false);
    }
  }

  function handleLogout() {
    clearSession();
    navigate('/');
  }

  function handleSelectGroup(groupworkId) {
    sessionStorage.setItem(SELECTED_GROUPWORK_STORAGE_KEY, String(groupworkId));
    setDraftAssignment({ ...draftAssignment, groupworkId });
  }

  function handleFocusAssignmentForm() {
    assignmentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    assignmentFormRef.current?.querySelector('input, select')?.focus();
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

          {isLoading && (
            <p className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
              Loading workspace data from backend...
            </p>
          )}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <DashboardPanel
              title="Current Assignments"
              action={`${completedCount}/${assignments.length} completed`}
            >
              <div className="mb-4 flex flex-wrap gap-2">
                {['All', 'Pending', 'In Progress', 'Review', 'Completed'].map((status) => (
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
                  <article key={assignment.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-black text-slate-950">{assignment.title}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {assignment.group} - {assignment.owner}
                        </p>
                      </div>
                      <span className={`w-fit rounded-md px-2 py-1 text-xs font-black ${statusStyles[assignment.status] || 'bg-slate-100 text-slate-600'}`}>
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
                        onClick={() => handleCompleteAssignment(assignment)}
                        disabled={assignment.status === 'Completed'}
                        className="rounded-md bg-[#073ca6] px-3 py-2 text-sm font-bold text-white disabled:bg-slate-300"
                      >
                        Mark Complete
                      </button>
                    </div>
                  </article>
                ))}

                {visibleAssignments.length === 0 && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">
                      {query.trim() || statusFilter !== 'All'
                        ? 'No assignments match the current workspace filter.'
                        : 'No assignments yet. Create your first assignment to start managing tasks.'}
                    </p>
                    {!query.trim() && statusFilter === 'All' && groups.length > 0 && (
                      <Button type="button" className="mt-3 px-4" onClick={handleFocusAssignmentForm}>
                        Create Assignment
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </DashboardPanel>

            <div className="grid gap-6">
              <DashboardPanel title="Create Assignment">
                <form id="create-assignment" ref={assignmentFormRef} onSubmit={handleCreateAssignment} className="grid gap-4">
                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">Group</span>
                    <select
                      value={draftAssignment.groupworkId}
                      onChange={(event) => handleSelectGroup(event.target.value)}
                      className="focus-ring h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                      disabled={!groups.length}
                    >
                      <option value="">Select group</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">Assignment Name</span>
                    <input
                      value={draftAssignment.name}
                      onChange={(event) => setDraftAssignment({ ...draftAssignment, name: event.target.value })}
                      placeholder="Example: Final report"
                      className="focus-ring h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">Description</span>
                    <textarea
                      value={draftAssignment.description}
                      onChange={(event) => setDraftAssignment({ ...draftAssignment, description: event.target.value })}
                      placeholder="Short assignment notes"
                      rows={3}
                      className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-sm font-bold text-slate-700">Deadline</span>
                      <input
                        type="date"
                        value={draftAssignment.deadline}
                        onChange={(event) => setDraftAssignment({ ...draftAssignment, deadline: event.target.value })}
                        className="focus-ring h-11 w-full rounded-md border border-slate-300 px-3 text-sm"
                      />
                    </label>
                    <label>
                      <span className="mb-2 block text-sm font-bold text-slate-700">Priority</span>
                      <select
                        value={draftAssignment.priority}
                        onChange={(event) => setDraftAssignment({ ...draftAssignment, priority: event.target.value })}
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
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                    <input
                      type="checkbox"
                      checked={draftAssignment.createReminder}
                      onChange={(event) => setDraftAssignment({ ...draftAssignment, createReminder: event.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-[#073ca6]"
                    />
                    Create deadline reminder
                  </label>
                  <Button type="submit" className="w-full" disabled={isCreatingAssignment || !groups.length}>
                    {isCreatingAssignment ? 'Creating...' : 'Create Assignment'}
                  </Button>
                  {!groups.length && (
                    <p className="text-sm font-semibold text-slate-500">
                      Please create or join a group before creating assignments.
                    </p>
                  )}
                </form>
              </DashboardPanel>

              {createdAssignment && (
                <DashboardPanel title="Assignment Created" action="Next step">
                  <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Assignment created</p>
                    <h3 className="mt-1 font-black text-slate-950">{createdAssignment.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {createdAssignment.groupName} - {createdAssignment.deadline}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      No tasks yet. Add tasks to divide the work.
                    </p>
                    <Button to="/leader" className="mt-4 px-4">
                      Add Task
                    </Button>
                  </div>
                </DashboardPanel>
              )}

              <DashboardPanel title="Workspace Health" action={`${averageProgress}% avg`}>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-[#073ca6]" style={{ width: `${averageProgress}%` }} />
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  Overall progress is calculated from the active assignments shown in this workspace.
                </p>
              </DashboardPanel>

              <DashboardPanel title="Groups">
                <div className="grid gap-3">
                  {groups.map((group) => (
                    <article key={group.id} className="rounded-lg bg-slate-50 p-4">
                      <p className="font-black text-slate-950">{group.name}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {group.subject} - {group.members} member{group.members === 1 ? '' : 's'} - {group.assignmentCount} assignment{group.assignmentCount === 1 ? '' : 's'}
                      </p>
                    </article>
                  ))}
                  {groups.length === 0 && (
                    <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                      No groups yet. Create or join a group to get started.
                    </p>
                  )}
                </div>
              </DashboardPanel>

              <DashboardPanel title="Activity">
                <div className="grid gap-2">
                  {activityLog.slice(0, 5).map((item) => (
                    <p key={item} className="rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-600">
                      {item}
                    </p>
                  ))}
                  {activityLog.length === 0 && (
                    <p className="rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-600">
                      No workspace activity yet.
                    </p>
                  )}
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
