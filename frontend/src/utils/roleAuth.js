const SESSION_KEY = 'saathi.activeSession';
const LEGACY_SESSION_KEY = 'volunteerIQ.activeSession';
const CITIZEN_USERS_KEY = 'saathi.citizenUsers';
const LEGACY_CITIZEN_USERS_KEY = 'volunteerIQ.citizenUsers';

function readSession() {
  const raw = localStorage.getItem(SESSION_KEY) || localStorage.getItem(LEGACY_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('role-auth-changed'));
}

function readCitizenUsers() {
  const raw = localStorage.getItem(CITIZEN_USERS_KEY) || localStorage.getItem(LEGACY_CITIZEN_USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeCitizenUsers(users) {
  localStorage.setItem(CITIZEN_USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  return readSession();
}

export function logoutSession() {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('role-auth-changed'));
}

export function saveSession(role, profile) {
  const session = {
    role,
    id: profile.id || crypto.randomUUID(),
    name: profile.name || 'User',
    email: profile.email || '',
    phone: profile.phone || '',
    city: profile.city || '',
    loginAt: new Date().toISOString(),
  };

  writeSession(session);
  return session;
}

export function loginAdmin({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  
  // DEMO MODE: Accept any valid email for testing purposes
  // In production, implement proper authentication
  const adminEmail = normalizedEmail || 'admin@saathi.com';
  
  // Extract name from email
  const nameParts = adminEmail.split('@')[0].split(/[._-]+/).map(part => part.charAt(0).toUpperCase() + part.slice(1));
  const displayName = nameParts.length > 1 ? nameParts.join(' ') : nameParts[0] || 'Admin';

  return saveSession('admin', {
    name: displayName,
    email: adminEmail,
  });
}

export function signupCitizenUser({ name, username, password, phone, city }) {
  const cleanName = String(name || '').trim();
  const cleanUsername = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (!cleanName) {
    throw new Error('Name is required.');
  }

  if (cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }

  if (cleanPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const users = readCitizenUsers();
  const exists = users.some((user) => user.username === cleanUsername);
  if (exists) {
    throw new Error('This username is already taken.');
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: cleanName,
    username: cleanUsername,
    password: cleanPassword,
    phone: String(phone || '').trim(),
    city: String(city || '').trim(),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeCitizenUsers(users);

  return {
    id: newUser.id,
    name: newUser.name,
    username: newUser.username,
    phone: newUser.phone,
    city: newUser.city,
  };
}

export function loginCitizen({ username, password }) {
  const cleanUsername = String(username || '').trim().toLowerCase();
  
  // DEMO MODE: Accept any valid username for testing purposes
  // In production, implement proper authentication
  if (!cleanUsername || cleanUsername.length === 0) {
    throw new Error('Username is required.');
  }

  // Extract name from username
  const nameParts = cleanUsername.split(/[._-]+/).map(part => part.charAt(0).toUpperCase() + part.slice(1));
  const displayName = nameParts.length > 1 ? nameParts.join(' ') : nameParts[0] || 'Citizen';

  return saveSession('citizen', {
    id: `citizen-${Date.now()}`,
    name: displayName,
    phone: '9876543210',
    city: 'India',
  });
}
