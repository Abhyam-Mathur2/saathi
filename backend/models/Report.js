const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    // Who submitted it
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', default: null },
    submittedByName: { type: String, default: 'Anonymous' },
    // Which NGO is handling this
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    // Location
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
        address: { type: String, default: '' }
    },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    // Issue details
    issueType: {
        type: String,
        required: true,
        enum: ['Food', 'Health', 'Education', 'Infrastructure', 'Safety', 'Environment', 'Other']
    },
    urgency: { type: Number, required: true, min: 1, max: 10 },
    description: { type: String, required: true },
    reportImage: { type: String, default: '' },
    // Processing
    source: { type: String, default: 'web' }, // web | whatsapp | voice | ocr
    originalText: { type: String, default: '' },
    aiAnalysis: {
        urgencyScore: Number,
        reasoning: String,
        category: String
    },
    // Status lifecycle
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Pending'
    },
    assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],
    // Completion
    completionPhoto: { type: String, default: '' },
    completionNote: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

ReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);
