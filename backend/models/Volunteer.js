const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
    },
    city: {
        type: String,
        default: '',
        trim: true,
    },
    state: {
        type: String,
        default: '',
        trim: true,
    },
    country: {
        type: String,
        default: 'India',
        trim: true,
    },
    role: {
        type: String,
        enum: ['ngo_worker', 'volunteer'],
        default: 'volunteer',
    },
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
    profileImage: {
        type: String, // Base64 string for demo purposes
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// For geospatial queries
VolunteerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Volunteer', VolunteerSchema);
