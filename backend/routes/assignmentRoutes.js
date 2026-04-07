const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

router.post('/', assignmentController.createAssignment);
router.get('/', assignmentController.getAssignments);
router.patch('/:id/respond', assignmentController.respondToAssignment);

module.exports = router;
