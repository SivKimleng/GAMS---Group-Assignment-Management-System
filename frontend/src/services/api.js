import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Tokens are tied to the backend signing secret, not the Vite port.  If an old
// development token is encountered, clear it and send the user to sign in
// rather than leaving the dashboard stuck with repeated "invalid token" errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('gams_session');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('gams_session');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback = 'Request failed. Please try again.') {
  return error.response?.data?.message || error.message || fallback;
}

export async function getUsers() {
  const response = await api.get('/users');
  return response.data;
}

export async function getHealth() {
  const response = await api.get('/health');
  return response.data;
}

export async function loginUser({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function registerUser({ first_name, last_name, email, password, role = 'Student' }) {
  const response = await api.post('/auth/register', {
    first_name,
    last_name,
    email,
    password,
    role
  });

  return response.data;
}

export function saveAuthSession({ token, user }, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  storage.setItem('token', token);
  storage.setItem('user', JSON.stringify(user));
  otherStorage.removeItem('token');
  otherStorage.removeItem('user');
}

export function getStoredUser() {
  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

export async function getCurrentUser() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function getGroupworks() {
  const response = await api.get('/groupworks');
  return response.data;
}

export async function getGroupworkMembers(groupworkId) {
  const response = await api.get(`/groupworks/${groupworkId}/members`);
  return response.data;
}

export async function removeGroupworkMember(groupworkId, userId) {
  const response = await api.delete(`/groupworks/${groupworkId}/members/${userId}`);
  return response.data;
}

export async function leaveGroupwork(groupworkId) {
  const response = await api.post(`/groupworks/${groupworkId}/leave`);
  return response.data;
}

export async function createGroupwork(payload) {
  const response = await api.post('/groupworks', payload);
  return response.data;
}

export async function joinGroupworkByCode(groupworkCode) {
  const response = await api.post('/groupworks/0/join', { groupwork_code: groupworkCode });
  return response.data;
}

export async function getAssignments() {
  const response = await api.get('/assignments');
  return response.data;
}

export async function createAssignment(payload) {
  const response = await api.post('/assignments', payload);
  return response.data;
}

export async function updateAssignment(assignmentId, payload) {
  const response = await api.put(`/assignments/${assignmentId}`, payload);
  return response.data;
}

export async function getAssignmentProgress(assignmentId) {
  const response = await api.get(`/assignments/${assignmentId}/progress`);
  return response.data;
}

export async function getTasks() {
  const response = await api.get('/tasks');
  return response.data;
}

export async function createTask(payload) {
  const response = await api.post('/tasks', payload);
  return response.data;
}

export async function getAssignmentMaterials(assignmentId) {
  const response = await api.get(`/assignments/${assignmentId}/materials`);
  return response.data;
}

export async function addAssignmentMaterial(assignmentId, payload) {
  const response = await api.post(`/assignments/${assignmentId}/materials`, payload);
  return response.data;
}

export async function createPersonalTask(payload) {
  const response = await api.post('/tasks/personal', payload);
  return response.data;
}

export async function updateTaskStatus(taskId, status) {
  const response = await api.patch(`/tasks/${taskId}/status`, { status });
  return response.data;
}

export async function deleteTask(taskId) {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
}

export async function getTask(taskId) {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
}

export async function getTaskSubmission(taskId) {
  const response = await api.get(`/tasks/${taskId}/submission`);
  return response.data;
}

export async function submitTask(taskId, payload) {
  const response = await api.post(`/tasks/${taskId}/submission`, payload);
  return response.data;
}

export async function unsubmitTask(taskId) {
  const response = await api.post(`/tasks/${taskId}/unsubmit`);
  return response.data;
}

export async function getReminders() {
  const response = await api.get('/reminders');
  return response.data;
}

export async function createReminder(payload) {
  const response = await api.post('/reminders', payload);
  return response.data;
}

export async function markReminderRead(reminderId) {
  const response = await api.patch(`/reminders/${reminderId}/read`);
  return response.data;
}

export default api;
