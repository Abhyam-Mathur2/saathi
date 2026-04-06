const SESSION_KEY = 'saathi.activeSession';
const LEGACY_SESSION_KEY = 'volunteerIQ.activeSession';
const CITIZEN_USERS_KEY = 'saathi.citizenUsers';
const LEGACY_CITIZEN_USERS_KEY = 'volunteerIQ.citizenUsers';
const ADMIN_USERS_KEY = 'saathi.adminUsers';

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

function readAdminUsers() {
  const raw = localStorage.getItem(ADMIN_USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeAdminUsers(users) {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  return readSession();
}

export function logoutSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('saathi.activeRole');
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
    ngoName: profile.ngoName || '',
    loginAt: new Date().toISOString(),
  };

  writeSession(session);
  return session;
}

// ─── Admin Auth ──────────────────────────────────────────────

export function signupAdmin({ name, email, password, ngoName }) {
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');
  const cleanNgoName = String(ngoName || '').trim();

  if (!cleanName) throw new Error('Name is required.');
  if (!cleanEmail || cleanEmail.length < 3) throw new Error('A valid email is required.');
  if (cleanPassword.length < 6) throw new Error('Password must be at least 6 characters.');
  if (!cleanNgoName) throw new Error('NGO name is required.');

  const admins = readAdminUsers();
  const exists = admins.some((a) => a.email === cleanEmail);
  if (exists) throw new Error('An admin account with this email already exists.');

  const newAdmin = {
    id: crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
    password: cleanPassword,
    ngoName: cleanNgoName,
    createdAt: new Date().toISOString(),
  };

  admins.push(newAdmin);
  writeAdminUsers(admins);

  return {
    id: newAdmin.id,
    name: newAdmin.name,
    email: newAdmin.email,
    ngoName: newAdmin.ngoName,
  };
}

export function loginAdmin({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  // Check hardcoded demo admin account first
  const demoAdmins = [
    { email: 'admin@saathi.com', password: 'Admin@2026', name: 'Admin', ngoName: 'Saathi HQ' },
  ];

  const demoMatch = demoAdmins.find(
    (demo) => demo.email === normalizedEmail && demo.password === cleanPassword
  );

  if (demoMatch) {
    return saveSession('admin', {
      id: `demo-admin-${Date.now()}`,
      name: demoMatch.name,
      email: demoMatch.email,
      ngoName: demoMatch.ngoName,
    });
  }

  // Then check localStorage for registered admin accounts
  const admins = readAdminUsers();
  const admin = admins.find(
    (a) => a.email === normalizedEmail && a.password === cleanPassword
  );

  if (!admin) {
    throw new Error('Invalid admin email or password.');
  }

  return saveSession('admin', {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    ngoName: admin.ngoName,
  });
}

// ─── Citizen Auth ────────────────────────────────────────────

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

  // Check hardcoded demo citizen accounts first (fallback)
  const demoCitizens = [
    { username: 'citizen_demo', password: 'Citizen@2026', name: 'Demo Citizen' },
    { username: 'priya_demo', password: 'Citizen@2026', name: 'Priya Sharma' },
  ];

  const demoMatch = demoCitizens.find(
    (demo) => demo.username === cleanUsername && demo.password === cleanPassword
  );

  if (demoMatch) {
    return saveSession('citizen', {
      id: `demo-citizen-${Date.now()}`,
      name: demoMatch.name,
      phone: '',
      city: 'Demo',
    });
  }

  // Then check localStorage for registered citizen accounts
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
