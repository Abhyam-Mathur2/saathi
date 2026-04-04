/**
 * Seed demo accounts into localStorage for testing
 * This function runs once on app startup to populate demo credentials
 */

export function seedDemoAccounts() {
  const VOLUNTEER_USERS_KEY = 'saathi.users';
  const CITIZEN_USERS_KEY = 'saathi.citizenUsers';
  const DEMO_SEEDED_FLAG = 'saathi.demoSeededFlag';

  // Check if demo accounts are already seeded
  const alreadySeeded = localStorage.getItem(DEMO_SEEDED_FLAG);
  if (alreadySeeded) {
    return; // Demo accounts already seeded, skip
  }

  // Seed demo volunteer accounts
  const demoVolunteers = [
    {
      id: 'demo-volunteer-1',
      name: 'John Doe',
      email: 'john@saathi.com',
      phone: '9876543210',
      password: 'Volunteer@2026',
      skills: ['Medical Aid', 'First Aid'],
      location: { lat: 28.6139, lng: 77.209 },
      availability: 'Weekend',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-volunteer-2',
      name: 'Sarah Smith',
      email: 'sarah@saathi.com',
      phone: '9876543211',
      password: 'Volunteer@2026',
      skills: ['Teaching', 'Mentoring'],
      location: { lat: 28.5355, lng: 77.391 },
      availability: 'Weekday',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-volunteer-3',
      name: 'Raj Kumar',
      email: 'raj@saathi.com',
      phone: '9876543212',
      password: 'Volunteer@2026',
      skills: ['Construction', 'Manual Labor'],
      location: { lat: 28.4595, lng: 77.1342 },
      availability: 'Full-time',
      createdAt: new Date().toISOString(),
    },
  ];

  // Seed demo citizen accounts
  const demoCitizens = [
    {
      id: 'demo-citizen-1',
      name: 'Rahul Gupta',
      username: 'citizen_demo',
      password: 'Citizen@2026',
      phone: '9987654321',
      city: 'Delhi',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-citizen-2',
      name: 'Priya Sharma',
      username: 'priya_demo',
      password: 'Citizen@2026',
      phone: '9987654322',
      city: 'Mumbai',
      createdAt: new Date().toISOString(),
    },
  ];

  try {
    // Check if volunteer users already exist (to avoid overwriting real data)
    const existingVolunteers = localStorage.getItem(VOLUNTEER_USERS_KEY);
    if (!existingVolunteers || existingVolunteers === '[]') {
      localStorage.setItem(VOLUNTEER_USERS_KEY, JSON.stringify(demoVolunteers));
      console.log('✅ Demo volunteer accounts seeded');
    }

    // Check if citizen users already exist
    const existingCitizens = localStorage.getItem(CITIZEN_USERS_KEY);
    if (!existingCitizens || existingCitizens === '[]') {
      localStorage.setItem(CITIZEN_USERS_KEY, JSON.stringify(demoCitizens));
      console.log('✅ Demo citizen accounts seeded');
    }

    // Mark as seeded
    localStorage.setItem(DEMO_SEEDED_FLAG, 'true');
    console.log('✅ Demo accounts initialization complete');
  } catch (error) {
    console.error('❌ Error seeding demo accounts:', error);
  }
}

/**
 * Reset demo accounts (useful for testing)
 * Call this from browser console: import { resetDemoAccounts } from './utils/seedDemoAccounts'; resetDemoAccounts();
 */
export function resetDemoAccounts() {
  localStorage.removeItem('saathi.users');
  localStorage.removeItem('saathi.citizenUsers');
  localStorage.removeItem('saathi.demoSeededFlag');
  console.log('✅ Demo accounts reset. Refresh the page to re-seed.');
}
