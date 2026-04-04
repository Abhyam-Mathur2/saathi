const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
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
    assignedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
