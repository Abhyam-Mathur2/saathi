const express = require('express');
const router = express.Router();
// Optional: use actual DB or localStore. Using simple memory array for hackathon fallback.
let events = [
  {
    _id: 'e1',
    title: 'Community Food Drive',
    description: 'Distributing food packets to flood-affected areas.',
    eventType: 'Donation',
    date: new Date(Date.now() + 86400000).toISOString(),
    location: { address: 'Community Hall, Sector 4' },
    targetAudience: 'both',
    registeredVolunteers: [],
    status: 'Upcoming'
  },
  {
    _id: 'e2',
    title: 'Free Health Checkup',
    description: 'Basic health screening and medicine distribution.',
    eventType: 'Medical Camp',
    date: new Date(Date.now() + 172800000).toISOString(),
    location: { address: 'City Hospital Grounds' },
    targetAudience: 'citizens',
    registeredVolunteers: [],
    status: 'Upcoming'
  }
];

router.get('/', (req, res) => {
  const { audience } = req.query;
  let filtered = events;
  if (audience) {
    filtered = events.filter(e => e.targetAudience === 'both' || e.targetAudience === audience);
  }
  res.json(filtered);
});

router.post('/', (req, res) => {
  const newEvent = { _id: Date.now().toString(), ...req.body, status: 'Upcoming', registeredVolunteers: [] };
  events.push(newEvent);
  res.status(201).json(newEvent);
});

router.delete('/:id', (req, res) => {
  events = events.filter(e => e._id !== req.params.id);
  res.json({ success: true });
});

router.post('/:id/register', (req, res) => {
  const { userId } = req.body;
  const event = events.find(e => e._id === req.params.id);
  if (event && !event.registeredVolunteers.includes(userId)) {
    event.registeredVolunteers.push(userId);
  }
  res.json({ success: true, event });
});

module.exports = router;