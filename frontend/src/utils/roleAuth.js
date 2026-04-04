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
  const adminEmail = 'admin@saathi.com';
  const adminPassword = 'Saathi@Admin2026!';

  if (email.trim().toLowerCase() !== adminEmail || password !== adminPassword) {
    throw new Error('Invalid admin credentials.');
  }

  return saveSession('admin', {
    name: 'Admin',
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
  const cleanPassword = String(password || '');

  const users = readCitizenUsers();
  const user = users.find(
    (item) => item.username === cleanUsername && item.password === cleanPassword
  );

  if (!user) {
    throw new Error('Invalid username or password.');
  }

  return saveSession('citizen', {
    id: user.id,
    name: user.name,
    phone: user.phone,
    city: user.city,
  });
}
