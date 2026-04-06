const USERS_KEY = 'saathi.users';
const LEGACY_USERS_KEY = 'volunteerIQ.users';
const SESSION_KEY = 'saathi.session';
const LEGACY_SESSION_KEY = 'volunteerIQ.session';

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY) || localStorage.getItem(LEGACY_USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logoutVolunteer() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('volunteer-auth-changed'));
}

export function signupVolunteer({ name, email, phone, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();

  const existing = users.find((user) => user.email === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    phone: phone.trim(),
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  return { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone };
}

export function loginVolunteer({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  // DEMO MODE: Accept any valid email for testing purposes
  // In production, implement proper authentication
  if (!normalizedEmail || normalizedEmail.length === 0) {
    throw new Error('Email is required.');
  }

  // Extract name from email (e.g., 'john.doe@example.com' -> 'John Doe')
  const nameParts = normalizedEmail.split('@')[0].split(/[._-]+/).map(part => part.charAt(0).toUpperCase() + part.slice(1));
  const displayName = nameParts.length > 1 ? nameParts.join(' ') : nameParts[0] || 'Volunteer';

  const session = {
    id: `volunteer-${Date.now()}`,
    name: displayName,
    email: normalizedEmail,
    phone: '9876543210', // Default demo phone
    loginAt: new Date().toISOString(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('volunteer-auth-changed'));
  return session;
}
