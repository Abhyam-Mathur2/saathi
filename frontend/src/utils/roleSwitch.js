export function canUserSwitch(session) {
  if (!session) return false;
  const identifier = session.email || session.phone;
  if (!identifier) return false;
  
  // Checking both citizen and volunteer storage
  const citizens = JSON.parse(localStorage.getItem('saathi.citizenUsers') || '[]');
  const volunteers = JSON.parse(localStorage.getItem('saathi.users') || '[]');
  
  const isCitizen = citizens.some(c => c.email === identifier || c.phone === identifier);
  const isVolunteer = volunteers.some(v => v.email === identifier || v.phone === identifier);
  
  return isCitizen && isVolunteer;
}

export function getActiveRole(session) {
  if (!session) return null;
  const storedRole = localStorage.getItem('saathi.activeRole');
  if (storedRole && ['citizen', 'volunteer'].includes(storedRole)) {
    return storedRole;
  }
  return session.role;
}

export function toggleRole(session) {
  if (!canUserSwitch(session)) return;
  const current = getActiveRole(session);
  const next = current === 'citizen' ? 'volunteer' : 'citizen';
  localStorage.setItem('saathi.activeRole', next);
  
  // Dispatch event
  window.dispatchEvent(new CustomEvent('saathi-role-switched', { detail: next }));
  
  // Post availability if switching to volunteer
  if (next === 'volunteer' && session.id) {
    fetch(`/api/volunteers/${session.id}/toggle-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: true })
    }).catch(e => console.error(e));
  }
}