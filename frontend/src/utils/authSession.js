import { clearAuthSession, getStoredUser, saveAuthSession } from '../services/api.js';
import { formatUser } from './dataMappers.js';

const SESSION_KEY = 'gams_session';

export function saveSession(user, remember = false) {
  if (user?.token) {
    saveAuthSession({ token: user.token, user: formatUser(user.user) }, remember);
    return;
  }

  const payload = JSON.stringify({
    user: formatUser(user),
    signedInAt: new Date().toISOString()
  });

  const primaryStorage = remember ? localStorage : sessionStorage;
  const secondaryStorage = remember ? sessionStorage : localStorage;

  primaryStorage.setItem(SESSION_KEY, payload);
  secondaryStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const storedUser = getStoredUser();

  if (storedUser) {
    return {
      user: formatUser(storedUser),
      signedInAt: null
    };
  }

  const rawSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSession() {
  clearAuthSession();
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function userFromEmail(email) {
  const name = email
    .split('@')[0]
    .replace(/[-_.]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();

  return {
    firstName: name.split(' ')[0] || 'Student',
    fullName: name || 'Student',
    email
  };
}
