const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: false, default: '' },
    email: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    password: { type: String, default: '' },
    // Organization reference — null means independent volunteer
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
    skills: [{
        type: String,
        enum: ['Medical', 'Food Distribution', 'Education', 'Construction', 'Logistics', 'Counseling', 'Tech Support', 'Transportation']
    }],
    availability: {
        days: [String],
        times: [String]
    },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: false, default: [0, 0] }, // [longitude, latitude]
        address: String
    },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    isAvailable: { type: Boolean, default: true },
    completedTasks: { type: Number, default: 0 },
    rating: { type: Number, default: 5, min: 1, max: 10 },
    profileImage: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

VolunteerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Volunteer', VolunteerSchema);
