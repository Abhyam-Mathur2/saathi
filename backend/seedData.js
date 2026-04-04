const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Report = require('./models/Report');
const Volunteer = require('./models/Volunteer');

const reports = [
    {
        issueType: 'Food',
        urgency: 9,
        description: 'Severe food shortage in flood-affected village near Patna. 50 families need immediate dry rations.',
        location: { coordinates: [85.1376, 25.5941], address: 'Danapur, Patna, Bihar' },
        status: 'Pending'
    },
    {
        issueType: 'Health',
        urgency: 10,
        description: 'Medical emergency: Outbreak of water-borne diseases in temporary shelter. Need doctors and medicines.',
        location: { coordinates: [85.1500, 25.6000], address: 'Shelter Camp 4, Patna' },
        status: 'Pending'
    },
    {
        issueType: 'Infrastructure',
        urgency: 7,
        description: 'Main approach road to the village blocked by fallen trees. Needs heavy equipment or manual labor.',
        location: { coordinates: [77.2090, 28.6139], address: 'Outer Ring Road, New Delhi' },
        status: 'Pending'
    },
    {
        issueType: 'Education',
        urgency: 4,
        description: 'Local primary school roof damaged. Need volunteers for minor repairs and organizing temporary classes.',
        location: { coordinates: [72.8777, 19.0760], address: 'Dharavi, Mumbai' },
        status: 'Pending'
    },
    {
        issueType: 'Safety',
        urgency: 8,
        description: 'Elderly residents stranded in waterlogged building. Need evacuation assistance.',
        location: { coordinates: [80.2707, 13.0827], address: 'Velachery, Chennai' }
    },
    {
        issueType: 'Environment',
        urgency: 6,
        description: 'Oil spill in local lake affecting local fauna. Need volunteers for cleanup.',
        location: { coordinates: [77.5946, 12.9716], address: 'Ulsoor Lake, Bangalore' }
    },
    {
        issueType: 'Food',
        urgency: 5,
        description: 'Community kitchen running low on vegetables and grains. Regular supply needed.',
        location: { coordinates: [88.3639, 22.5726], address: 'Salt Lake, Kolkata' }
    },
    {
        issueType: 'Health',
        urgency: 8,
        description: 'Blood donation camp needed due to recent accidents in the area.',
        location: { coordinates: [73.8567, 18.5204], address: 'Shivajinagar, Pune' }
    },
    {
        issueType: 'Infrastructure',
        urgency: 3,
        description: 'Street lights not working in Sector 15. Safety concern at night.',
        location: { coordinates: [77.0266, 28.4595], address: 'Gurgaon, Haryana' }
    },
    {
        issueType: 'Other',
        urgency: 5,
        description: 'Stray animals injured during heavy rains. Need veterinary assistance.',
        location: { coordinates: [75.8577, 22.7196], address: 'Indore, MP' }
    }
];

const volunteers = [
    {
        name: 'Amit Sharma',
        phone: '9876543210',
        email: 'amit@example.com',
        skills: ['Medical', 'Logistics'],
        availability: { days: ['Monday', 'Wednesday', 'Friday'], times: ['Morning'] },
        location: { coordinates: [85.1400, 25.5900], address: 'Patna, Bihar' }
    },
    {
        name: 'Priya Patel',
        phone: '9823456789',
        email: 'priya@example.com',
        skills: ['Food Distribution', 'Counseling'],
        availability: { days: ['Saturday', 'Sunday'], times: ['Afternoon'] },
        location: { coordinates: [72.8800, 19.0800], address: 'Mumbai, Maharashtra' }
    },
    {
        name: 'Rahul Verma',
        phone: '9123456780',
        email: 'rahul@example.com',
        skills: ['Construction', 'Logistics', 'Transportation'],
        availability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], times: ['Morning'] },
        location: { coordinates: [77.2100, 28.6200], address: 'Delhi' }
    },
    {
        name: 'Sita Ramani',
        phone: '9445566778',
        email: 'sita@example.com',
        skills: ['Education', 'Tech Support'],
        availability: { days: ['Friday', 'Saturday'], times: ['Morning'] },
        location: { coordinates: [80.2800, 13.0900], address: 'Chennai' }
    },
    {
        name: 'Vikram Singh',
        phone: '9988776655',
        email: 'vikram@example.com',
        skills: ['Logistics', 'Transportation'],
        availability: { days: ['Monday', 'Wednesday', 'Friday'], times: ['Afternoon'] },
        location: { coordinates: [77.6000, 12.9800], address: 'Bangalore' }
    },
    {
        name: 'Anjali Gupta',
        phone: '9765432109',
        email: 'anjali@example.com',
        skills: ['Medical', 'Counseling'],
        availability: { days: ['Tuesday', 'Thursday'], times: ['Morning'] },
        location: { coordinates: [88.3700, 22.5800], address: 'Kolkata' }
    },
    {
        name: 'Karan Mehra',
        phone: '9554433221',
        email: 'karan@example.com',
        skills: ['Construction', 'Tech Support'],
        availability: { days: ['Saturday', 'Sunday'], times: ['Afternoon'] },
        location: { coordinates: [73.8600, 18.5300], address: 'Pune' }
    },
    {
        name: 'Sneha Reddy',
        phone: '9001122334',
        email: 'sneha@example.com',
        skills: ['Food Distribution', 'Education'],
        availability: { days: ['Wednesday', 'Thursday', 'Friday'], times: ['Morning'] },
        location: { coordinates: [78.4867, 17.3850], address: 'Hyderabad' }
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding...');
        
        await Report.deleteMany({});
        await Volunteer.deleteMany({});
        
        await Report.insertMany(reports);
        await Volunteer.insertMany(volunteers);
        
        console.log('Database Seeded! 10 Reports and 8 Volunteers added.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
