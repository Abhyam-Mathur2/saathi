const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    skills: [{
        type: String,
        enum: ['Medical', 'Food Distribution', 'Education', 'Construction', 'Logistics', 'Counseling', 'Tech Support', 'Transportation']
    }],
    availability: {
        days: [String],
        times: [String]
    },
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// For geospatial queries
VolunteerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Volunteer', VolunteerSchema);
