const express = require('express');
const router = express.Router();
const ImpactZone = require('../models/ImpactZone');
const groqService = require('../services/groqService');
const axios = require('axios');

router.get('/heatmap', async (req, res) => {
    try {
        const query = ImpactZone.find({});
        const zones = await query.timeout({ serverSelectionTimeoutMS: 5000 });
        res.json({ success: true, data: zones });
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

router.get('/predict/:zoneId', async (req, res) => {
    try {
        const zone = await ImpactZone.findOne({ zoneId: req.params.zoneId });
        if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });

        const prompt = `System: You are a crisis prediction analyst. Respond only in JSON.
        User: Given this zone data: poverty=${zone.worldBankPovertyIndex}, waterAccess=${zone.worldBankWaterAccess}, weatherSeverity=${zone.weatherSeverity}, activeReports=${zone.activeReports}, predict:
        1. urgency score for next 7 days (1-10)
        2. most likely crisis type
        3. recommended volunteer types needed
        4. confidence score (0-1)
        Respond as JSON: { "predictedUrgency": 8, "crisisType": "Flood", "recommendedSkills": ["Medical", "Rescue"], "confidence": 0.85, "reasoning": "High severity weather." }`;

        const response = await groqService.generateCompletion(prompt);
        // Assuming groqService returns JSON string or object
        let prediction = typeof response === 'string' ? JSON.parse(response) : response;
        
        zone.predictedUrgency = prediction.predictedUrgency;
        zone.predictedCrisisType = prediction.crisisType;
        await zone.save();

        res.json({ success: true, data: prediction });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.get('/satellite/:lat/:lng', async (req, res) => {
    try {
        const { lat, lng } = req.params;
        let weatherSeverity = 0;
        let weatherData = null;

        if (process.env.OPENWEATHER_API_KEY) {
            const wRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_API_KEY}`);
            weatherData = wRes.data;
            weatherSeverity = (weatherData.weather && weatherData.weather[0].main.includes('Rain')) ? 8 : 2;
        }

        res.json({
            success: true,
            data: {
                weatherData,
                riskScore: weatherSeverity,
                alertLevel: weatherSeverity > 7 ? 'HIGH' : 'LOW'
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;
