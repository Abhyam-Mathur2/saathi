const express = require('express');
const router = express.Router();
const citizenController = require('../controllers/citizenController');

router.post('/', citizenController.registerCitizen);
router.get('/', citizenController.getCitizens);
router.get('/nearby-organizations', citizenController.getNearbyOrganizations);
router.get('/my-reports', citizenController.getMyReports);

module.exports = router;
