const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
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
        required: true,
        trim: true,
    },
    country: {
        type: String,
        default: 'India',
        trim: true,
    },
    address: {
        type: String,
        default: '',
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
    radiusKm: {
        type: Number,
        default: 25,
        min: 1,
        max: 250,
    },
    active: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

OrganizationSchema.index({ location: '2dsphere' });
OrganizationSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model('Organization', OrganizationSchema);
