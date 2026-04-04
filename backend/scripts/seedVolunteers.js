const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');

const MONGODB_URI = process.env.MONGODB_URI;

const volunteers = [
    {
        name: 'Amit Sharma',
        phone: '9876543210',
        email: 'amit@example.com',
        skills: ['Medical', 'Logistics'],
        availability: true,
        location: { type: 'Point', coordinates: [85.1400, 25.5900], address: 'Patna, Bihar' }
    },
    {
        name: 'Priya Patel',
        phone: '9823456789',
        email: 'priya@example.com',
        skills: ['Food Distribution', 'Counseling'],
        availability: true,
        location: { type: 'Point', coordinates: [72.8800, 19.0800], address: 'Mumbai, Maharashtra' }
    },
    {
        name: 'Rahul Verma',
        phone: '9123456780',
        email: 'rahul@example.com',
        skills: ['Construction', 'Logistics', 'Transportation'],
        availability: true,
        location: { type: 'Point', coordinates: [77.2100, 28.6200], address: 'Delhi' }
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        // We keep existing reports but ensure they have status 'Pending'
        await Report.updateMany({}, { status: 'Pending' });
        console.log('✅ Updated all reports to Pending status');

        // Add volunteers with availability: true
        for (const v of volunteers) {
            await Volunteer.findOneAndUpdate({ email: v.email }, v, { upsert: true, new: true });
        }
        console.log('✅ Seeded 3 compatible volunteers');

    } catch (error) {
        console.error('❌ Seeding error:', error.message);
    } finally {
        mongoose.connection.close();
    }
}

seed();
