const cron = require('node-cron');
const ImpactZone = require('../models/ImpactZone');
const axios = require('axios');
const groqService = require('../services/groqService');

// Runs every 6 hours
cron.schedule('0 */6 * * *', async () => {
    console.log('Running Impact Score Update Job...');
    try {
        const zones = await ImpactZone.find({});
        for (const zone of zones) {
            let weatherSeverity = zone.weatherSeverity;

            if (process.env.OPENWEATHER_API_KEY) {
                try {
                    const wRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${zone.lat}&lon=${zone.lng}&appid=${process.env.OPENWEATHER_API_KEY}`);
                    weatherSeverity = (wRes.data.weather[0].main.includes('Rain') || wRes.data.weather[0].main.includes('Storm')) ? 9 : 2;
                } catch(e) {}
            }

            zone.weatherSeverity = weatherSeverity;
            zone.currentUrgency = Math.min(10, zone.currentUrgency + (weatherSeverity > 7 ? 2 : 0));
            zone.lastUpdated = new Date();
            await zone.save();

            if (zone.currentUrgency > 7) {
                try {
                    const prompt = `System: You are a crisis prediction analyst. Respond only in JSON.
                    User: Predict for zone with urgency ${zone.currentUrgency}, weatherSeverity ${weatherSeverity}.
                    Respond as JSON: { "predictedUrgency": 8, "crisisType": "Flood", "recommendedSkills": ["Medical"], "confidence": 0.9, "reasoning": "Severe weather." }`;
                    const response = await groqService.generateCompletion(prompt);
                    const prediction = typeof response === 'string' ? JSON.parse(response) : response;
                    zone.predictedUrgency = prediction.predictedUrgency;
                    zone.predictedCrisisType = prediction.crisisType;
                    await zone.save();
                } catch(e) {}
            }
        }
        console.log('Impact Score Update Job Completed.');
    } catch (error) {
        console.error('Impact Score Update Job Failed:', error.message);
    }
});
