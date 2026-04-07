const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }, // null = auto-planner
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Declined', 'Cancelled'],
        default: 'Pending'
    },
    notes: { type: String, default: '' },
    // Timestamps
    assignedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    declinedAt: { type: Date, default: null },
    // Completion evidence
    completionPhoto: { type: String, default: '' },
    completionNote: { type: String, default: '' }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
