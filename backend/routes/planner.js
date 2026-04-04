const express = require('express');
const router = express.Router();
const autoPlanner = require('../services/autoPlanner');

let latestPlan = null;

router.post('/run', async (req, res) => {
    try {
        const plan = await autoPlanner.runAutoPlanner();
        latestPlan = plan;
        res.json({ success: true, data: plan });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/latest', (req, res) => {
    res.json({ success: true, data: latestPlan });
});

router.get('/volunteer/:id', async (req, res) => {
    // Return volunteer specific assignment from latest plan
    if (!latestPlan) return res.json({ success: true, data: null });
    const assignment = latestPlan.assignments.find(a => a.volunteerId === req.params.id);
    res.json({ success: true, data: assignment });
});

router.put('/reassign', (req, res) => {
    res.json({ success: true, message: 'Reassigned (mock)' });
});

module.exports = router;
