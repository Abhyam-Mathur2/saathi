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

  // Check hardcoded demo volunteer accounts first (fallback for demo data)
  const demoVolunteers = [
    { email: 'john@saathi.com', password: 'Volunteer@2026', name: 'John Doe', phone: '9876543210' },
    { email: 'sarah@saathi.com', password: 'Volunteer@2026', name: 'Sarah Smith', phone: '9876543211' },
    { email: 'raj@saathi.com', password: 'Volunteer@2026', name: 'Raj Kumar', phone: '9876543212' },
  ];

  const demoMatch = demoVolunteers.find(
    (demo) => demo.email === normalizedEmail && demo.password === password
  );

  if (demoMatch) {
    const session = {
      id: `demo-volunteer-${Date.now()}`,
      name: demoMatch.name,
      email: demoMatch.email,
      phone: demoMatch.phone,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('volunteer-auth-changed'));
    return session;
  }

  // Then check localStorage for registered volunteers
  const users = readUsers();

  const user = users.find((u) => u.email === normalizedEmail && u.password === password);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    loginAt: new Date().toISOString(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('volunteer-auth-changed'));
  return session;
}
