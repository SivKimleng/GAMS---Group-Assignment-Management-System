import { clearAuthSession, getStoredUser, saveAuthSession } from '../services/api.js';

const SESSION_KEY = 'gams_mock_session';

function normalizeUser(user) {
  if (!user) return null;

  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  const fullName = user.fullName || `${firstName} ${lastName}`.trim() || user.email;

  return {
    ...user,
    firstName: firstName || fullName?.split(' ')[0] || 'Student',
    fullName
  };
}

export function saveMockSession(user, remember = false) {
  if (user?.token) {
    saveAuthSession({ token: user.token, user: normalizeUser(user.user) }, remember);
    return;
  }

  const payload = JSON.stringify({
    user: normalizeUser(user),
    signedInAt: new Date().toISOString()
  });

  const primaryStorage = remember ? localStorage : sessionStorage;
  const secondaryStorage = remember ? sessionStorage : localStorage;

  primaryStorage.setItem(SESSION_KEY, payload);
  secondaryStorage.removeItem(SESSION_KEY);
}

export function getMockSession() {
  const storedUser = getStoredUser();

  if (storedUser) {
    return {
      user: normalizeUser(storedUser),
      signedInAt: null
    };
  }

  const rawSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession);
  } catch {
    clearMockSession();
    return null;
  }
}

export function clearMockSession() {
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
    firstName: name.split(' ')[0] || 'Demo',
    fullName: name || 'Demo Student',
    email
  };
}
