const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');

router.post('/', volunteerController.registerVolunteer);
router.get('/', volunteerController.getVolunteers);
router.delete('/:id', volunteerController.deleteVolunteer);
router.post('/:id/toggle-availability', volunteerController.toggleAvailability);

// Assignment management
router.get('/:id/assignments', volunteerController.getVolunteerAssignments);
router.put('/:id/assignments/:assignmentId/accept', volunteerController.acceptAssignment);
router.put('/:id/assignments/:assignmentId/decline', volunteerController.declineAssignment);
router.put('/:id/assignments/:assignmentId/complete', volunteerController.completeAssignment);

// Work history (for admin)
router.get('/:id/work-history', volunteerController.getVolunteerWorkHistory);

module.exports = router;
