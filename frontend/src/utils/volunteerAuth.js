/**
 * volunteerAuth.js — Volunteer auth backed by MongoDB API
 */

const SESSION_KEY = 'saathi.activeSession';
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export async function loginVolunteer({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/volunteer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed.');

    const session = {
        role: 'volunteer',
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone,
        city: data.data.city,
        state: data.data.state,
        orgId: data.data.orgId || null,
        orgName: data.data.orgName || null,
        ngoName: data.data.orgName || '',
        skills: data.data.skills || [],
        loginAt: new Date().toISOString()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event('role-auth-changed'));
    return session;
}

export async function signupVolunteer({ name, email, phone, password, orgId, skills, city, state, location, availability, profileImage }) {
    const res = await fetch(`${API_BASE}/auth/volunteer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, orgId, skills, city, state, location, availability, profileImage })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Registration failed.');
    return data.data;
}

export function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function logoutVolunteer() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('role-auth-changed'));
}
