/**
 * roleAuth.js — Session management backed by MongoDB API
 * All login/register calls go to /api/auth/* endpoints.
 * Session is stored in localStorage for ProtectedRoute compatibility.
 */

const SESSION_KEY = 'saathi.activeSession';
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function readSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
}

function writeSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('role-auth-changed'));
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
        id: profile.id,
        name: profile.name || 'User',
        email: profile.email || '',
        phone: profile.phone || '',
        city: profile.city || '',
        state: profile.state || '',
        ngoName: profile.orgName || '',
        orgId: profile.orgId || null,
        orgLocation: profile.orgLocation || null,
        serviceRadiusKm: profile.serviceRadiusKm || 50,
        loginAt: new Date().toISOString(),
    };
    writeSession(session);
    return session;
}

// ─── Admin Auth ──────────────────────────────────────────────────────────────

export async function loginAdmin({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed.');
    return saveSession('admin', data.data);
}

export async function signupAdmin({ name, email, password, orgId }) {
    const res = await fetch(`${API_BASE}/auth/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, orgId })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Registration failed.');
    return data.data;
}

// ─── Citizen Auth ────────────────────────────────────────────────────────────

export async function loginCitizen({ username, password }) {
    const res = await fetch(`${API_BASE}/auth/citizen/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed.');
    return saveSession('citizen', data.data);
}

export async function signupCitizenUser({ name, username, password, phone, city, state }) {
    const res = await fetch(`${API_BASE}/auth/citizen/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, phone, city, state })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Registration failed.');
    return data.data;
}
