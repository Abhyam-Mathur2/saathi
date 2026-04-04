const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: String
    },
    issueType: {
        type: String,
        required: true,
        enum: ['Food', 'Health', 'Education', 'Infrastructure', 'Safety', 'Environment', 'Other']
    },
    urgency: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    description: {
        type: String,
        required: true
    },
    reportImage: {
        type: String,
        default: ''
    },
    source: {
        type: String,
        default: 'web'
    },
    originalText: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'Resolved'],
        default: 'Pending'
    },
    aiAnalysis: {
        urgencyScore: Number,
        reasoning: String,
        category: String
    },
    assignedVolunteers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// For geospatial queries
ReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);
