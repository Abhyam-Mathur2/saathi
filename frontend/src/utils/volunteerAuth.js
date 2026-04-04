const USERS_KEY = 'saathi.users';
const SESSION_KEY = 'saathi.session';

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
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
