const mongoose = require('mongoose');

const VolunteerRouteSchema = new mongoose.Schema({
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    routePoints: [{
        report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
        lat: Number,
        lng: Number,
        address: String,
        taskTitle: String,
        urgency: Number,
        estimatedDurationMinutes: Number,
        order: Number
    }],
    totalDistanceKm: { type: Number, default: 0 },
    estimatedDurationHours: { type: Number, default: 0 },
    polyline: { type: String } // Encoded polyline or simple JSON string for drawing
});

module.exports = mongoose.model('VolunteerRoute', VolunteerRouteSchema);