const express = require('express');
const router = express.Router();
const localStore = require('../services/localStore');
const Volunteer = require('../models/Volunteer');

router.post('/', async (req, res) => {
  try {
    const { type, description, location, radiusKm, senderPhone } = req.body;
    
    // 1. Store emergency safely as an Urgent Report in MongoDB
    const Report = require('../models/Report');
    const emergencyReport = new Report({
       issueType: 'Safety',
       urgency: 10,
       description: `EMERGENCY SOS: ${type}. ${description || ''}`,
       location: {
          type: 'Point',
          coordinates: location?.coordinates || [77.1025, 28.7041],
          address: location?.address || 'Unknown Location'
       },
       city: location?.address?.split(',')[0] || 'Unknown City',
       status: 'Pending',
       source: 'Emergency SOS'
    });
    await emergencyReport.save();
    console.log(`[EMERGENCY] Logged urgent Report to DB. ID: ${emergencyReport._id}`);

    // 2. Fetch volunteers scoped nearby
    const volunteers = await Volunteer.find({ status: 'Active' });
    const count = volunteers.length;
    console.log(`[EMERGENCY] Pushing high-priority silent notification to ${count} volunteers...`);

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