const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');

router.post('/', volunteerController.registerVolunteer);
router.get('/', volunteerController.getVolunteers);
router.delete('/:id', volunteerController.deleteVolunteer);

module.exports = router;
