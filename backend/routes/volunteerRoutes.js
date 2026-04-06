const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');

router.post('/', volunteerController.registerVolunteer);
router.get('/', volunteerController.getVolunteers);
router.delete('/:id', volunteerController.deleteVolunteer);
router.put('/:id/decline-task/:reportId', volunteerController.declineTask);
router.post('/:id/toggle-availability', volunteerController.toggleAvailability);

module.exports = router;
