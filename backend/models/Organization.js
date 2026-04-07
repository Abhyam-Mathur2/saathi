const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    serviceRadiusKm: { type: Number, default: 50 }, // nearby cities coverage
    contactPhone: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' }, // e.g. "+919876543210"
    email: { type: String, default: '' },
    categories: [{
        type: String,
        enum: ['Food', 'Health', 'Education', 'Infrastructure', 'Safety', 'Environment', 'Other']
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

OrganizationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Organization', OrganizationSchema);
