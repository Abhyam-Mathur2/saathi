const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
    },
    report: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        required: true
    },
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
        required: true
    },
    status: {
        type: String,
        enum: ['Assigned', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Assigned'
    },
    assignedBy: {
        type: String,
        default: '',
    },
    note: {
        type: String,
        default: '',
        trim: true,
    },
    responseNote: {
        type: String,
        default: '',
        trim: true,
    },
    acceptedAt: {
        type: Date,
        default: null,
    },
    declinedAt: {
        type: Date,
        default: null,
    },
    assignedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
