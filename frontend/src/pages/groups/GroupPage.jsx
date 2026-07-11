import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/layouts/Sidebar.jsx';
import MobileDashboardNav from '../../components/layouts/MobileDashboardNav.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmationModal from '../../components/ui/ConfirmationModal.jsx';
import { clearSession, getSession } from '../../utils/authSession.js';
import { formatDateLabel, formatUser, mapAssignment, mapTask, uniqueAssignments, uniqueTasks } from '../../utils/dataMappers.js';
import {
  createAssignment,
  createPersonalTask,
  createTask,
  deleteTask,
  getApiErrorMessage,
  getAssignments,
  getGroupworkMembers,
  getGroupworks,
  getTasks,
  leaveGroupwork,
  removeGroupworkMember,
  updateTaskStatus
} from '../../services/api.js';

const tabs = [
  ['dashboard', 'Group dashboard'],
  ['workspace', 'Workspace'],
  ['members', 'Members'],
  ['leader', 'Leader panel'],
  ['settings', 'Settings']
];

function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const user = formatUser(session?.user);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [notice, setNotice] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignmentDraft, setAssignmentDraft] = useState({ name: '', deadline: '', description: '', priority: 'Medium' });
  const [taskDraft, setTaskDraft] = useState({ assignmentId: '', assigneeId: '', name: '', dueDate: '', priority: 'Medium' });
  const [personalDraft, setPersonalDraft] = useState({ assignmentId: '', name: '', dueDate: '', priority: 'Medium' });

  const isLeader = Boolean(group && String(group.leader_user_id) === String(user.user_id));
  const groupAssignments = useMemo(
    () => assignments.filter((assignment) => String(assignment.groupwork_id) === String(groupId)),
    [assignments, groupId]
  );
  const groupTasks = useMemo(
    () => tasks.filter((task) => String(task.groupworkId) === String(groupId)),
    [tasks, groupId]
  );
  const teamTasks = groupTasks.filter((task) => !task.isPrivate);
  const myPrivateTasks = groupTasks.filter((task) => task.isPrivate);
  const completed = teamTasks.filter((task) => task.status === 'Completed').length;

  async function load() {
    setLoading(true);
    try {
      const [groupResponse, memberResponse, assignmentResponse, taskResponse] = await Promise.all([
        getGroupworks(), getGroupworkMembers(groupId), getAssignments(), getTasks()
      ]);
      const foundGroup = groupResponse.data.find((item) => String(item.groupwork_id) === String(groupId));
      if (!foundGroup) {
        navigate('/dashboard', { replace: true });
        return;
      }
      const nextAssignments = uniqueAssignments(assignmentResponse.data);
      setGroup(foundGroup);
      setMembers(memberResponse.data);
      setAssignments(nextAssignments);
      setTasks(uniqueTasks(taskResponse.data).map(mapTask));
      setTaskDraft((draft) => ({ ...draft, assignmentId: draft.assignmentId || String(nextAssignments.find((item) => String(item.groupwork_id) === String(groupId))?.assignment_id || '') }));
      setPersonalDraft((draft) => ({ ...draft, assignmentId: draft.assignmentId || String(nextAssignments.find((item) => String(item.groupwork_id) === String(groupId))?.assignment_id || '') }));
    } catch (error) {
      setNotice(getApiErrorMessage(error, 'Could not load this group.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitAssignment(event) {
    event.preventDefault();
    try {
      await createAssignment({ groupwork_id: groupId, assignment_name: assignmentDraft.name, assignment_description: assignmentDraft.description, deadline: assignmentDraft.deadline, priority: assignmentDraft.priority });
      setAssignmentDraft({ name: '', deadline: '', description: '', priority: 'Medium' });
      setNotice('Group assignment created.');
      await load();
    } catch (error) { setNotice(getApiErrorMessage(error, 'Could not create assignment.')); }
  }

  async function submitTeamTask(event) {
    event.preventDefault();
    try {
      await createTask({ assignment_id: taskDraft.assignmentId, assigned_user_id: taskDraft.assigneeId || null, task_name: taskDraft.name, due_date: taskDraft.dueDate, priority: taskDraft.priority });
      setTaskDraft((draft) => ({ ...draft, assigneeId: '', name: '', dueDate: '', priority: 'Medium' }));
      setNotice('Task assigned to the group member.');
      await load();
    } catch (error) { setNotice(getApiErrorMessage(error, 'Could not assign task.')); }
  }

  async function submitPersonalTask(event) {
    event.preventDefault();
    try {
      await createPersonalTask({ assignment_id: personalDraft.assignmentId, task_name: personalDraft.name, due_date: personalDraft.dueDate, priority: personalDraft.priority });
      setPersonalDraft((draft) => ({ ...draft, name: '', dueDate: '', priority: 'Medium' }));
      setNotice('Your private task was created. Only you can see it.');
      await load();
    } catch (error) { setNotice(getApiErrorMessage(error, 'Could not create private task.')); }
  }

  async function kick(member) {
    try {
      await removeGroupworkMember(groupId, member.user_id);
      setNotice('Member removed from the group.');
      await load();
    } catch (error) { setNotice(getApiErrorMessage(error, 'Could not remove member.')); }
  }

  async function toggleTask(task) {
    try {
      await updateTaskStatus(task.id, task.status === 'Completed' ? 'In Progress' : 'Completed');
      await load();
    } catch (error) { setNotice(getApiErrorMessage(error, 'Could not update task.')); }
  }

  async function leaveGroup() {
    try {
      const response = await leaveGroupwork(groupId);
      navigate('/dashboard', { replace: true });
      // The destination dashboard loads the deletion notice from the backend.
      return response;
    } catch (error) { setNotice(getApiErrorMessage(error, 'Could not leave group.')); }
  }

  async function removeTask(task) {
    try {
      await deleteTask(task.id);
      setNotice('Task deleted.');
      await load();
    } catch (error) { setNotice(getApiErrorMessage(error, 'Could not delete task.')); }
  }

  async function confirmAction() {
    const action = confirmation;
    setConfirmation(null);
    if (!action) return;
    if (action.type === 'kick') await kick(action.member);
    if (action.type === 'leave') await leaveGroup();
    if (action.type === 'delete-task') await removeTask(action.task);
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(group.groupwork_code);
      setNotice('Group password copied to clipboard.');
    } catch {
      setNotice(`Group password: ${group.groupwork_code}`);
    }
  }

  function logout() { clearSession(); navigate('/'); }
  const selectClass = 'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm';
  const inputClass = 'h-10 w-full rounded-md border border-slate-300 px-3 text-sm';

  return (
    <div className="min-h-screen bg-[#f5f7fb] lg:flex">
      <Sidebar user={user} onLogout={logout} />
      <main className="min-w-0 flex-1">
        <header className="border-b border-slate-200 bg-white"><div className="flex min-h-16 items-center justify-between px-4 sm:px-6 lg:px-8"><div><p className="text-xs font-black uppercase tracking-widest text-[#139f98]">Group workspace</p><h1 className="text-xl font-black text-slate-950">{group?.groupwork_name || 'Loading group...'}</h1></div><Button to="/dashboard" variant="secondary">All groups</Button></div><MobileDashboardNav /></header>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {notice && <div className="mb-5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">{notice}</div>}
          {loading ? <p className="rounded-lg bg-white p-4 font-semibold text-slate-500">Loading group workspace...</p> : <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <aside className="h-fit rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200"><p className="px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-400">{group.subject}</p>{tabs.filter(([key]) => key !== 'leader' || isLeader).map(([key, label]) => <button key={key} type="button" onClick={() => setTab(key)} className={`mb-1 w-full rounded-md px-3 py-2 text-left text-sm font-bold ${tab === key ? 'bg-[#073ca6] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>)}</aside>
            <section>
              {tab === 'dashboard' && <div className="grid gap-5"><div className="rounded-lg bg-[#073ca6] p-6 text-white"><p className="font-bold text-blue-100">{group.subject}</p><h2 className="mt-1 text-3xl font-black">{group.groupwork_name}</h2><p className="mt-2 text-sm text-blue-100">{group.description || 'No group description yet.'}</p><div className="mt-5 flex flex-wrap items-center gap-3 rounded-md bg-white/15 p-3"><div><p className="text-xs font-black uppercase tracking-wider text-blue-100">Group password / join code</p><p className="mt-1 font-mono text-lg font-black tracking-wider">{group.groupwork_code}</p></div><button type="button" onClick={copyPassword} className="rounded-md bg-white px-3 py-2 text-sm font-bold text-[#073ca6]">Copy password</button></div></div><div className="grid gap-4 sm:grid-cols-3"><Stat label="Members" value={members.length} /><Stat label="Assignments" value={groupAssignments.length} /><Stat label="Team tasks done" value={`${completed}/${teamTasks.length}`} /></div><TaskList title="Tasks assigned by the leader" tasks={teamTasks.filter((task) => !task.assignedUserId || String(task.assignedUserId) === String(user.user_id) || isLeader)} onToggle={toggleTask} onDelete={isLeader ? (task) => setConfirmation({ type: 'delete-task', task }) : null} /></div>}
              {tab === 'workspace' && <div className="grid gap-6 xl:grid-cols-2"><TaskList title="My group tasks" tasks={teamTasks.filter((task) => !task.assignedUserId || String(task.assignedUserId) === String(user.user_id) || isLeader)} onToggle={toggleTask} onDelete={isLeader ? (task) => setConfirmation({ type: 'delete-task', task }) : null} /><div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-black">My private tasks</h2><p className="mt-1 text-sm text-slate-500">These tasks are visible only to you.</p><form className="mt-4 grid gap-3" onSubmit={submitPersonalTask}><select required className={selectClass} value={personalDraft.assignmentId} onChange={(e) => setPersonalDraft({ ...personalDraft, assignmentId: e.target.value })}><option value="">Choose assignment</option>{groupAssignments.map((item) => <option key={item.assignment_id} value={item.assignment_id}>{item.assignment_name}</option>)}</select><input required className={inputClass} placeholder="Personal task" value={personalDraft.name} onChange={(e) => setPersonalDraft({ ...personalDraft, name: e.target.value })}/><input required type="date" className={inputClass} value={personalDraft.dueDate} onChange={(e) => setPersonalDraft({ ...personalDraft, dueDate: e.target.value })}/><Button type="submit">Add private task</Button></form><div className="mt-5"><TaskList title="Only me" tasks={myPrivateTasks} onToggle={toggleTask} onDelete={(task) => setConfirmation({ type: 'delete-task', task })} compact /></div></div></div>}
              {tab === 'members' && <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-black">Group members</h2><div className="mt-4 grid gap-3">{members.map((member) => <div key={member.user_id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3"><div><p className="font-bold text-slate-950">{member.first_name} {member.last_name}</p><p className="text-sm text-slate-500">{member.group_role === 'Leader' ? 'Leader' : 'Normal student'} · {member.email}</p></div>{isLeader && member.group_role !== 'Leader' && <button type="button" onClick={() => setConfirmation({ type: 'kick', member })} className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">Kick</button>}</div>)}</div></div>}
              {tab === 'leader' && isLeader && <div className="grid gap-6 xl:grid-cols-2"><form className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200" onSubmit={submitAssignment}><h2 className="text-lg font-black">Create group assignment</h2><div className="mt-4 grid gap-3"><input required className={inputClass} placeholder="Assignment name" value={assignmentDraft.name} onChange={(e) => setAssignmentDraft({ ...assignmentDraft, name: e.target.value })}/><textarea className="rounded-md border border-slate-300 p-3 text-sm" placeholder="Description" value={assignmentDraft.description} onChange={(e) => setAssignmentDraft({ ...assignmentDraft, description: e.target.value })}/><input required type="date" className={inputClass} value={assignmentDraft.deadline} onChange={(e) => setAssignmentDraft({ ...assignmentDraft, deadline: e.target.value })}/><Button type="submit">Create assignment</Button></div></form><form className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200" onSubmit={submitTeamTask}><h2 className="text-lg font-black">Assign a member task</h2><div className="mt-4 grid gap-3"><select required className={selectClass} value={taskDraft.assignmentId} onChange={(e) => setTaskDraft({ ...taskDraft, assignmentId: e.target.value })}><option value="">Choose assignment</option>{groupAssignments.map((item) => <option key={item.assignment_id} value={item.assignment_id}>{item.assignment_name}</option>)}</select><select className={selectClass} value={taskDraft.assigneeId} onChange={(e) => setTaskDraft({ ...taskDraft, assigneeId: e.target.value })}><option value="">Whole group / unassigned</option>{members.map((member) => <option key={member.user_id} value={member.user_id}>{member.first_name} {member.last_name}</option>)}</select><input required className={inputClass} placeholder="Task name" value={taskDraft.name} onChange={(e) => setTaskDraft({ ...taskDraft, name: e.target.value })}/><input required type="date" className={inputClass} value={taskDraft.dueDate} onChange={(e) => setTaskDraft({ ...taskDraft, dueDate: e.target.value })}/><Button type="submit">Assign task</Button></div></form><div className="xl:col-span-2"><TaskList title="All group tasks" tasks={teamTasks} onToggle={toggleTask} onDelete={(task) => setConfirmation({ type: 'delete-task', task })} /></div></div>}
              {tab === 'settings' && <div className="max-w-xl rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-black">Group settings</h2><p className="mt-2 text-sm text-slate-600">Leave this group whenever you no longer need access.</p>{isLeader && <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">Warning: as the group leader, leaving will permanently delete the group and all group assignments and tasks.</p>}<button type="button" onClick={() => setConfirmation({ type: 'leave' })} className="mt-5 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">{isLeader ? 'Delete group and leave' : 'Leave group'}</button></div>}
            </section>
          </div>}
        </div>
      </main>
      <ConfirmationModal isOpen={Boolean(confirmation)} title={confirmation?.type === 'kick' ? 'Remove member?' : confirmation?.type === 'delete-task' ? 'Delete task?' : 'Are you sure you want to leave the group?'} message={confirmation?.type === 'kick' ? `Remove ${confirmation.member.first_name} ${confirmation.member.last_name} from this group?` : confirmation?.type === 'delete-task' ? `Delete "${confirmation.task.title}" permanently?` : isLeader ? 'Leaving as the leader will permanently delete this group and all of its assignments and tasks.' : 'You will lose access to this group and its work.'} confirmLabel="Yes" onConfirm={confirmAction} onCancel={() => setConfirmation(null)} />
    </div>
  );
}

function Stat({ label, value }) { return <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200"><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>; }
function TaskList({ title, tasks, onToggle, onDelete, compact = false }) { return <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200"><h2 className="text-lg font-black">{title}</h2><div className="mt-4 grid gap-3">{tasks.map((task) => <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"><div><p className="font-bold text-slate-950">{task.title}</p><p className="text-sm text-slate-500">{task.assignment} · {task.assignee} · due {formatDateLabel(task.dueDate)}</p></div><div className="flex gap-2"><button type="button" onClick={() => onToggle(task)} className={`rounded-md px-3 py-2 text-sm font-bold ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{task.status}</button>{onDelete && <button type="button" onClick={() => onDelete(task)} className="rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">Delete</button>}</div></div>)}{!tasks.length && <p className="text-sm font-semibold text-slate-500">{compact ? 'No private tasks yet.' : 'No tasks to show yet.'}</p>}</div></div>; }

export default GroupPage;
