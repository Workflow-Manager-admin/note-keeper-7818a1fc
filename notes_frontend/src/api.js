//
// Simple API helper for backend integration
//
const API_BASE = 'http://localhost:3001/api';

export const setAuthToken = (token) => {
  if (token) localStorage.setItem('jwt', token);
  else localStorage.removeItem('jwt');
};

export const getAuthToken = () => localStorage.getItem('jwt');

function authHeader() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// PUBLIC_INTERFACE
export async function register(username, password) {
  /**
   * Register a new user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<object>}
   */
  const r = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error((await r.json()).message || 'Registration failed');
  return r.json();
}

// PUBLIC_INTERFACE
export async function login(username, password) {
  /**
   * Login user, returns { token, user }
   * @param {string} username
   * @param {string} password
   * @returns {Promise<object>}
   */
  const r = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error((await r.json()).message || 'Login failed');
  return r.json();
}

// PUBLIC_INTERFACE
export async function fetchNotes(query = '') {
  /**
   * Fetch list of notes, optional search query
   * @param {string} query (optional)
   * @returns {Promise<Array>}
   */
  let q = query ? '?q=' + encodeURIComponent(query) : '';
  const r = await fetch(`${API_BASE}/notes${q}`, {
    headers: { ...authHeader() },
  });
  if (r.status === 401) throw new Error('Unauthorized');
  if (!r.ok) throw new Error('Failed to fetch notes');
  return r.json();
}

// PUBLIC_INTERFACE
export async function fetchNote(id) {
  /**
   * Fetch a single note by ID
   */
  const r = await fetch(`${API_BASE}/notes/${id}`, { headers: { ...authHeader() } });
  if (r.status === 401) throw new Error('Unauthorized');
  if (!r.ok) throw new Error('Note not found');
  return r.json();
}

// PUBLIC_INTERFACE
export async function createNote({ title, content }) {
  /**
   * Create a new note
   */
  const r = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ title, content }),
  });
  if (r.status === 401) throw new Error('Unauthorized');
  if (!r.ok) throw new Error('Failed to create note');
  return r.json();
}

// PUBLIC_INTERFACE
export async function updateNote(id, { title, content }) {
  /**
   * Update an existing note
   */
  const r = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ title, content }),
  });
  if (r.status === 401) throw new Error('Unauthorized');
  if (!r.ok) throw new Error('Failed to update note');
  return r.json();
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /**
   * Delete a note by ID
   */
  const r = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() },
  });
  if (r.status === 401) throw new Error('Unauthorized');
  if (!r.ok) throw new Error('Failed to delete note');
  return r.json();
}
