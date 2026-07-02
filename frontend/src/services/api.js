const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/api/users`);

  if (!response.ok) {
    throw new Error(`GET /api/users failed with status ${response.status}`);
  }

  return response.json();
}
