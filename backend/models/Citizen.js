const mongoose = require('mongoose');

const CitizenSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
    },
    createdAt: { type: Date, default: Date.now }
});

CitizenSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Citizen', CitizenSchema);
