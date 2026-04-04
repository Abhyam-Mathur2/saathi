const mongoose = require('mongoose');

const ImpactZoneSchema = new mongoose.Schema({
    zoneId: { type: String, required: true, unique: true },
    placeName: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    state: { type: String },
    country: { type: String, default: 'India' },
    currentUrgency: { type: Number, default: 5 }, // 1-10
    crisisType: { type: String },
    affectedPopulation: { type: Number, default: 0 },
    worldBankPovertyIndex: { type: Number, default: 0 },
    worldBankWaterAccess: { type: Number, default: 100 },
    weatherSeverity: { type: Number, default: 0 },
    activeReports: { type: Number, default: 0 },
    predictedUrgency: { type: Number },
    predictedCrisisType: { type: String },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ImpactZone', ImpactZoneSchema);
