import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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

export async function createGroupwork(payload) {
  const response = await api.post('/groupworks', payload);
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

export async function getTasks() {
  const response = await api.get('/tasks');
  return response.data;
}

export async function createTask(payload) {
  const response = await api.post('/tasks', payload);
  return response.data;
}

export async function updateTaskStatus(taskId, status) {
  const response = await api.patch(`/tasks/${taskId}/status`, { status });
  return response.data;
}

export default api;
