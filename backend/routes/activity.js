const express = require('express');
const router = express.Router();
const { getVolunteerActivity, getRecentActivity, logPing } = require('../controllers/activityController');

router.get('/volunteer/:volunteerId', getVolunteerActivity);
router.get('/recent', getRecentActivity);
router.post('/ping', logPing);

module.exports = router;
