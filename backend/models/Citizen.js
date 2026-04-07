const mongoose = require('mongoose');

const CitizenSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        default: '',
        trim: true,
        lowercase: true,
    },
    city: {
        type: String,
        required: true,
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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            default: [77.1025, 28.7041],
        },
        address: {
            type: String,
            default: '',
        },
    },
    preferredOrganization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
    },
    assignedVolunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer',
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

CitizenSchema.index({ location: '2dsphere' });
CitizenSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model('Citizen', CitizenSchema);
