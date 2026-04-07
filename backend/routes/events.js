const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

router.get('/', async (req, res) => {
  try {
    const { audience } = req.query;
    let query = {};
    if (audience) {
      query.targetAudience = { $in: ['both', audience] };
    }
    const eventsList = await Event.find(query).sort({ date: 1 });
    res.json(eventsList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newEvent = new Event({
      ...req.body,
      status: 'Upcoming',
      registeredVolunteers: []
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/register', async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    if (!event.registeredVolunteers.includes(userId)) {
      event.registeredVolunteers.push(userId);
      await event.save();
    }
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;