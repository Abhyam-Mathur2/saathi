const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const groqService = require('../services/groqService');
const axios = require('axios');

// Build heatmap zones from real reports, filtered by city
router.get('/heatmap', async (req, res) => {
    try {
        const { city } = req.query;
        const query = { status: { $nin: ['Resolved'] } };
        if (city) query.city = { $regex: new RegExp(city, 'i') };

        const reports = await Report.find(query).lean();

        // Group reports by city to create zones
        const cityMap = {};
        for (const r of reports) {
            const key = r.city || r.location?.address || 'Unknown';
            if (!cityMap[key]) {
                cityMap[key] = {
                    zoneId: key.replace(/\s+/g, '-').toLowerCase(),
                    placeName: key,
                    lat: r.location?.coordinates?.[1] || 20,
                    lng: r.location?.coordinates?.[0] || 77,
                    reports: [],
                    crisisType: r.issueType || 'General',
                    affectedPopulation: 0,
                    weatherSeverity: 3
                };
            }
            cityMap[key].reports.push(r);
            cityMap[key].affectedPopulation += 100;
        }

        const zones = Object.values(cityMap).map(z => ({
            ...z,
            currentUrgency: Math.min(10, Math.round(
                z.reports.reduce((sum, r) => sum + (r.urgency || 5), 0) / z.reports.length
            )),
            activeReports: z.reports.length,
            crisisType: z.reports.sort((a, b) => (b.urgency || 0) - (a.urgency || 0))[0]?.issueType || 'General',
        }));

        res.json({ success: true, data: zones });
    } catch (e) {
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
