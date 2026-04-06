const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/', reportController.createReport);
router.get('/', reportController.getReports);
router.get('/match/:reportId', reportController.getMatchesForReport);
router.put('/:reportId/complete', reportController.completeReport);
router.post('/analyze-image', reportController.analyzeImage);

module.exports = router;
