const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/', reportController.createReport);
router.get('/', reportController.getReports);
router.get('/:reportId', reportController.getReport);
router.put('/:reportId', reportController.updateReport);
router.get('/match/:reportId', reportController.getMatchesForReport);
router.put('/:reportId/assign', reportController.assignVolunteer);
router.put('/:reportId/decline', reportController.declineTask);
router.put('/:reportId/complete', reportController.completeReport);
router.post('/:reportId/generate-tweet', reportController.generateTweet);
router.post('/analyze-image', reportController.analyzeImage);
router.get('/citizen/:citizenId', reportController.getCitizenReports);

module.exports = router;
