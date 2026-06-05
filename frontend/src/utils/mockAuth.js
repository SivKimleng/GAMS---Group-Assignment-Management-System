const SESSION_KEY = 'gams_mock_session';

export function saveMockSession(user, remember = false) {
  const payload = JSON.stringify({
    user,
    signedInAt: new Date().toISOString()
  });

  const primaryStorage = remember ? localStorage : sessionStorage;
  const secondaryStorage = remember ? sessionStorage : localStorage;

  primaryStorage.setItem(SESSION_KEY, payload);
  secondaryStorage.removeItem(SESSION_KEY);
}

export function getMockSession() {
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
