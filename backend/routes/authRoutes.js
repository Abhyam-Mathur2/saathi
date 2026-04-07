const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Admin
router.post('/admin/login', authController.adminLogin);
router.post('/admin/register', authController.adminRegister);

// Volunteer
router.post('/volunteer/login', authController.volunteerLogin);
router.post('/volunteer/register', authController.volunteerRegister);

// Citizen
router.post('/citizen/login', authController.citizenLogin);
router.post('/citizen/register', authController.citizenRegister);

module.exports = router;
