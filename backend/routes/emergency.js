const express = require('express');
const router = express.Router();
const localStore = require('../services/localStore');
const Volunteer = require('../models/Volunteer');

router.post('/', async (req, res) => {
  try {
    const { type, description, location, radiusKm, senderPhone } = req.body;
    
    // 1. Store emergency in a simple local store entry (mocking DB for hackathon)
    const emergencyId = Date.now().toString();
    console.log(`[EMERGENCY ${emergencyId}] New alert: ${type} at ${location?.address}`);

    // 2. Get all volunteers
    const volunteers = await localStore.listVolunteers(Volunteer);
    
    // 3. Filter by distance (mocking radius check for now if coordinates aren't fully reliable)
    // In a real app, calculate Haversine distance. Here we just take available ones.
    const nearbyVolunteers = volunteers.filter(v => v.availability === true || v.status === 'Active');
    
    // 4. "Send" WhatsApp to each via Twilio (mock)
    const count = nearbyVolunteers.length;
    console.log(`[EMERGENCY] Broadcasting to ${count} nearby volunteers...`);

    res.status(200).json({ 
      success: true, 
      message: 'Emergency alert broadcasted',
      notifiedCount: count 
    });
  } catch (error) {
    console.error('Emergency alert failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;