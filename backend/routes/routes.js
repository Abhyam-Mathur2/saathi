const express = require('express');
const router = express.Router();
const routeOptimizer = require('../services/routeOptimizer');
const VolunteerRoute = require('../models/VolunteerRoute');
const Volunteer = require('../models/Volunteer');
const Report = require('../models/Report');

router.get('/volunteer/:volunteerId', async (req, res) => {
    try {
        const query = VolunteerRoute.findOne({ volunteer: req.params.volunteerId }).populate('routePoints.report');
        const vr = await query.timeout({ serverSelectionTimeoutMS: 5000 });
        if (!vr) return res.status(404).json({ success: false, message: 'Route not found' });
        res.json({ success: true, data: vr });
    } catch (e) {
        if (e.message && (e.message.includes('timeout') || e.message.includes('buffering'))) {
            return res.status(503).json({ 
                success: false, 
                message: 'Database temporarily unavailable. Please try again.'
            });
        }
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/optimize-all', async (req, res) => {
    try {
        // Mock implementation for the scope
        const query = VolunteerRoute.find({});
        const routes = await query.timeout({ serverSelectionTimeoutMS: 5000 });
        res.json({ success: true, message: 'All routes optimized', data: routes });
    } catch (e) {
        if (e.message && (e.message.includes('timeout') || e.message.includes('buffering'))) {
            return res.status(503).json({ 
                success: false, 
                message: 'Database temporarily unavailable. Please try again.',
                data: []
            });
        }
        res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/cluster/:zoneId', async (req, res) => {
    res.json({ success: true, data: [] });
});

module.exports = router;