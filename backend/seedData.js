const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');

const Organization = require('./models/Organization');
const Admin = require('./models/Admin');
const Volunteer = require('./models/Volunteer');
const Citizen = require('./models/Citizen');
const Report = require('./models/Report');
const Assignment = require('./models/Assignment');

const DEMO_VOLUNTEER_PASSWORD = 'SaathiVol!2026#';

// ─── Organizations ────────────────────────────────────────────────────────────
const orgsData = [
    {
        name: 'CareIndia Delhi',
        description: 'Emergency relief and food distribution across Delhi NCR.',
        city: 'Delhi', state: 'Delhi',
        location: { type: 'Point', coordinates: [77.2090, 28.6139] },
        serviceRadiusKm: 80,
        contactPhone: '9876500001', whatsappNumber: '+919876500001',
        email: 'contact@careindia-delhi.org',
        categories: ['Food', 'Health', 'Safety']
    },
    {
        name: 'Relief Mumbai',
        description: 'Community welfare and health services across Mumbai and Pune.',
        city: 'Mumbai', state: 'Maharashtra',
        location: { type: 'Point', coordinates: [72.8777, 19.0760] },
        serviceRadiusKm: 100,
        contactPhone: '9876500002', whatsappNumber: '+919876500002',
        email: 'help@reliefmumbai.org',
        categories: ['Health', 'Education', 'Food']
    },
    {
        name: 'Patna Aid Foundation',
        description: 'Flood relief and infrastructure support for Bihar regions.',
        city: 'Patna', state: 'Bihar',
        location: { type: 'Point', coordinates: [85.1376, 25.5941] },
        serviceRadiusKm: 60,
        contactPhone: '9876500003', whatsappNumber: '+919876500003',
        email: 'care@patnaaid.org',
        categories: ['Food', 'Infrastructure', 'Safety']
    },
    {
        name: 'GreenBangalore Trust',
        description: 'Environmental and education drives across Karnataka.',
        city: 'Bangalore', state: 'Karnataka',
        location: { type: 'Point', coordinates: [77.5946, 12.9716] },
        serviceRadiusKm: 70,
        contactPhone: '9876500004', whatsappNumber: '+919876500004',
        email: 'info@greenbangalore.org',
        categories: ['Environment', 'Education', 'Infrastructure']
    },
    {
        name: 'Chennai Care Network',
        description: 'Rapid disaster response and community support in Tamil Nadu.',
        city: 'Chennai', state: 'Tamil Nadu',
        location: { type: 'Point', coordinates: [80.2707, 13.0827] },
        serviceRadiusKm: 75,
        contactPhone: '9876500005', whatsappNumber: '+919876500005',
        email: 'reach@chennaicares.org',
        categories: ['Health', 'Safety', 'Food']
    }
];

// ─── Volunteers (2-3 per city, some independent) ──────────────────────────────
const volunteersData = (orgIds) => [
    // Delhi - CareIndia
    {
        name: 'Rahul Verma', email: 'rahul@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9911001001', organization: orgIds[0],
        skills: ['Logistics', 'Transportation', 'Food Distribution'],
        availability: { days: ['Monday','Wednesday','Friday'], times: ['Morning'] },
        location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Connaught Place, Delhi' },
        city: 'Delhi', state: 'Delhi', completedTasks: 14
    },
    {
        name: 'Ananya Singh', email: 'ananya@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9911001002', organization: orgIds[0],
        skills: ['Medical', 'Counseling'],
        availability: { days: ['Tuesday','Thursday','Saturday'], times: ['Morning','Afternoon'] },
        location: { type: 'Point', coordinates: [77.1025, 28.7041], address: 'Rohini, Delhi' },
        city: 'Delhi', state: 'Delhi', completedTasks: 8
    },
    // Mumbai - Relief
    {
        name: 'Priya Patel', email: 'priya@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9922002001', organization: orgIds[1],
        skills: ['Food Distribution', 'Education', 'Counseling'],
        availability: { days: ['Monday','Tuesday','Wednesday','Thursday','Friday'], times: ['Afternoon'] },
        location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Andheri, Mumbai' },
        city: 'Mumbai', state: 'Maharashtra', completedTasks: 22
    },
    {
        name: 'Karan Mehra', email: 'karan@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9922002002', organization: orgIds[1],
        skills: ['Construction', 'Tech Support', 'Logistics'],
        availability: { days: ['Saturday','Sunday'], times: ['Morning','Afternoon'] },
        location: { type: 'Point', coordinates: [72.8567, 19.2403], address: 'Thane, Maharashtra' },
        city: 'Mumbai', state: 'Maharashtra', completedTasks: 5
    },
    // Patna - Patna Aid
    {
        name: 'Amit Sharma', email: 'amit@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9933003001', organization: orgIds[2],
        skills: ['Medical', 'Logistics', 'Food Distribution'],
        availability: { days: ['Monday','Wednesday','Friday'], times: ['Morning'] },
        location: { type: 'Point', coordinates: [85.1376, 25.5941], address: 'Patna, Bihar' },
        city: 'Patna', state: 'Bihar', completedTasks: 31
    },
    {
        name: 'Renu Kumari', email: 'renu@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9933003002', organization: orgIds[2],
        skills: ['Counseling', 'Education'],
        availability: { days: ['Tuesday','Thursday','Saturday'], times: ['Morning'] },
        location: { type: 'Point', coordinates: [85.1500, 25.6100], address: 'Danapur, Patna, Bihar' },
        city: 'Patna', state: 'Bihar', completedTasks: 9
    },
    // Bangalore - GreenBangalore
    {
        name: 'Vikram Nair', email: 'vikram@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9944004001', organization: orgIds[3],
        skills: ['Construction', 'Logistics', 'Transportation'],
        availability: { days: ['Monday','Wednesday','Friday'], times: ['Afternoon'] },
        location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Koramangala, Bangalore' },
        city: 'Bangalore', state: 'Karnataka', completedTasks: 18
    },
    {
        name: 'Sneha Reddy', email: 'sneha@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9944004002', organization: orgIds[3],
        skills: ['Education', 'Tech Support', 'Counseling'],
        availability: { days: ['Saturday','Sunday'], times: ['Morning'] },
        location: { type: 'Point', coordinates: [77.5600, 12.9800], address: 'Indiranagar, Bangalore' },
        city: 'Bangalore', state: 'Karnataka', completedTasks: 12
    },
    // Chennai - Chennai Care
    {
        name: 'Sita Ramani', email: 'sita@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9955005001', organization: orgIds[4],
        skills: ['Medical', 'Food Distribution', 'Logistics'],
        availability: { days: ['Monday','Tuesday','Thursday'], times: ['Morning'] },
        location: { type: 'Point', coordinates: [80.2707, 13.0827], address: 'Velachery, Chennai' },
        city: 'Chennai', state: 'Tamil Nadu', completedTasks: 26
    },
    {
        name: 'Muthu Kumar', email: 'muthu@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9955005002', organization: orgIds[4],
        skills: ['Construction', 'Transportation'],
        availability: { days: ['Wednesday','Friday','Saturday'], times: ['Afternoon'] },
        location: { type: 'Point', coordinates: [80.2500, 13.0600], address: 'Anna Nagar, Chennai' },
        city: 'Chennai', state: 'Tamil Nadu', completedTasks: 7
    },
    // Independent volunteer (no org)
    {
        name: 'Anjali Gupta', email: 'anjali@saathi.com', password: DEMO_VOLUNTEER_PASSWORD,
        phone: '9966006001', organization: null,
        skills: ['Medical', 'Counseling', 'Education'],
        availability: { days: ['Monday','Tuesday','Wednesday','Thursday','Friday'], times: ['Morning','Afternoon'] },
        location: { type: 'Point', coordinates: [88.3639, 22.5726], address: 'Salt Lake, Kolkata' },
        city: 'Kolkata', state: 'West Bengal', completedTasks: 3
    }
];

// ─── Citizens ─────────────────────────────────────────────────────────────────
const citizensData = [
    { name: 'Deepak Yadav', username: 'deepak.delhi', password: 'Citizen@2026', phone: '9800100001', city: 'Delhi', state: 'Delhi', location: { type: 'Point', coordinates: [77.1734, 28.6772] } },
    { name: 'Meera Joshi', username: 'meera.mumbai', password: 'Citizen@2026', phone: '9800100002', city: 'Mumbai', state: 'Maharashtra', location: { type: 'Point', coordinates: [72.9121, 19.1136] } },
    { name: 'Suraj Kumar', username: 'suraj.patna', password: 'Citizen@2026', phone: '9800100003', city: 'Patna', state: 'Bihar', location: { type: 'Point', coordinates: [85.1200, 25.5800] } },
    { name: 'Kavya Naidu', username: 'kavya.blr', password: 'Citizen@2026', phone: '9800100004', city: 'Bangalore', state: 'Karnataka', location: { type: 'Point', coordinates: [77.6100, 12.9300] } },
    { name: 'Lakshmi Rajan', username: 'lakshmi.chn', password: 'Citizen@2026', phone: '9800100005', city: 'Chennai', state: 'Tamil Nadu', location: { type: 'Point', coordinates: [80.2100, 13.0500] } }
];

// ─── Reports ──────────────────────────────────────────────────────────────────
const reportsData = (orgIds, citizenIds) => [
    // Delhi
    { organization: orgIds[0], submittedBy: citizenIds[0], submittedByName: 'Deepak Yadav', city: 'Delhi', state: 'Delhi', issueType: 'Food', urgency: 9, description: 'Severe food shortage in flood-affected colony near Yamuna. 80 families need emergency dry rations.', location: { type: 'Point', coordinates: [77.2303, 28.6117], address: 'Yamuna Bazar, Delhi' }, status: 'Pending', source: 'web' },
    { organization: orgIds[0], submittedBy: citizenIds[0], submittedByName: 'Deepak Yadav', city: 'Delhi', state: 'Delhi', issueType: 'Health', urgency: 8, description: 'Dengue outbreak in Rohini Sector 15. Families need mosquito nets and medicines.', location: { type: 'Point', coordinates: [77.1025, 28.7041], address: 'Rohini Sector 15, Delhi' }, status: 'Assigned', source: 'web' },
    { organization: orgIds[0], submittedBy: null, submittedByName: 'Anonymous', city: 'Delhi', state: 'Delhi', issueType: 'Safety', urgency: 7, description: 'Waterlogged underpass trapping pedestrians during heavy rain near ITO.', location: { type: 'Point', coordinates: [77.2468, 28.6274], address: 'ITO, Delhi' }, status: 'Resolved', resolvedAt: new Date(Date.now() - 86400000), source: 'web' },
    { organization: orgIds[0], submittedBy: citizenIds[0], submittedByName: 'Deepak Yadav', city: 'Gurgaon', state: 'Delhi', issueType: 'Infrastructure', urgency: 5, description: 'Street lights out in Sector 56 Gurgaon causing safety issues at night.', location: { type: 'Point', coordinates: [77.0266, 28.4595], address: 'Sector 56, Gurgaon' }, status: 'Pending', source: 'web' },
    // Mumbai
    { organization: orgIds[1], submittedBy: citizenIds[1], submittedByName: 'Meera Joshi', city: 'Mumbai', state: 'Maharashtra', issueType: 'Health', urgency: 10, description: 'Medical emergency: water-borne disease outbreak in Dharavi. Need doctors and ORS immediately.', location: { type: 'Point', coordinates: [72.8530, 19.0478], address: 'Dharavi, Mumbai' }, status: 'Assigned', source: 'web' },
    { organization: orgIds[1], submittedBy: citizenIds[1], submittedByName: 'Meera Joshi', city: 'Mumbai', state: 'Maharashtra', issueType: 'Education', urgency: 4, description: 'Local school roof damaged after heavy rains. Classes suspended — need volunteers.', location: { type: 'Point', coordinates: [72.8777, 19.1136], address: 'Andheri East, Mumbai' }, status: 'Pending', source: 'web' },
    { organization: orgIds[1], submittedBy: null, submittedByName: 'Anonymous', city: 'Pune', state: 'Maharashtra', issueType: 'Health', urgency: 8, description: 'Blood donation camp urgently needed after highway accident in Pune.', location: { type: 'Point', coordinates: [73.8567, 18.5204], address: 'Shivajinagar, Pune' }, status: 'Resolved', resolvedAt: new Date(Date.now() - 172800000), source: 'web' },
    // Patna
    { organization: orgIds[2], submittedBy: citizenIds[2], submittedByName: 'Suraj Kumar', city: 'Patna', state: 'Bihar', issueType: 'Food', urgency: 9, description: 'Flood-affected village near Danapur — 50 families stranded with no food access.', location: { type: 'Point', coordinates: [85.1376, 25.5941], address: 'Danapur, Patna, Bihar' }, status: 'In Progress', source: 'web' },
    { organization: orgIds[2], submittedBy: citizenIds[2], submittedByName: 'Suraj Kumar', city: 'Patna', state: 'Bihar', issueType: 'Infrastructure', urgency: 7, description: 'Main road to Bihta blocked by fallen trees after storm. Ambulance can\'t pass.', location: { type: 'Point', coordinates: [84.9600, 25.5600], address: 'Bihta, Patna District' }, status: 'Pending', source: 'web' },
    { organization: orgIds[2], submittedBy: null, submittedByName: 'Anonymous', city: 'Patna', state: 'Bihar', issueType: 'Health', urgency: 10, description: 'Waterborne disease outbreak at temporary shelter camp. Need doctors urgently.', location: { type: 'Point', coordinates: [85.1500, 25.6000], address: 'Relief Camp 4, Patna' }, status: 'Assigned', source: 'web' },
    // Bangalore
    { organization: orgIds[3], submittedBy: citizenIds[3], submittedByName: 'Kavya Naidu', city: 'Bangalore', state: 'Karnataka', issueType: 'Environment', urgency: 6, description: 'Industrial waste dumped into Ulsoor Lake affecting wildlife and local fishermen.', location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Ulsoor Lake, Bangalore' }, status: 'Pending', source: 'web' },
    { organization: orgIds[3], submittedBy: citizenIds[3], submittedByName: 'Kavya Naidu', city: 'Bangalore', state: 'Karnataka', issueType: 'Education', urgency: 5, description: 'Government school in Whitefield lacks basic supplies — notebooks, pens, and furniture.', location: { type: 'Point', coordinates: [77.7480, 12.9698], address: 'Whitefield, Bangalore' }, status: 'Resolved', resolvedAt: new Date(Date.now() - 259200000), source: 'web' },
    { organization: orgIds[3], submittedBy: null, submittedByName: 'Anonymous', city: 'Mysore', state: 'Karnataka', issueType: 'Infrastructure', urgency: 4, description: 'Bridge under repair — alternative route needed for 3 villages.', location: { type: 'Point', coordinates: [76.6394, 12.2958], address: 'Mysore-Bangalore Highway' }, status: 'Pending', source: 'web' },
    // Chennai
    { organization: orgIds[4], submittedBy: citizenIds[4], submittedByName: 'Lakshmi Rajan', city: 'Chennai', state: 'Tamil Nadu', issueType: 'Safety', urgency: 8, description: 'Elderly residents stranded in waterlogged building in Velachery — need evacuation.', location: { type: 'Point', coordinates: [80.2707, 13.0127], address: 'Velachery, Chennai' }, status: 'In Progress', source: 'web' },
    { organization: orgIds[4], submittedBy: citizenIds[4], submittedByName: 'Lakshmi Rajan', city: 'Chennai', state: 'Tamil Nadu', issueType: 'Food', urgency: 7, description: 'Community kitchen running out of essentials — serving 200+ daily.', location: { type: 'Point', coordinates: [80.2200, 13.0800], address: 'Anna Nagar, Chennai' }, status: 'Pending', source: 'web' },
    { organization: orgIds[4], submittedBy: null, submittedByName: 'Anonymous', city: 'Chennai', state: 'Tamil Nadu', issueType: 'Health', urgency: 9, description: 'Fever and malaria spike in Perambur slum — need medical team within 24 hours.', location: { type: 'Point', coordinates: [80.2339, 13.1146], address: 'Perambur, Chennai' }, status: 'Assigned', source: 'web' }
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas for seeding...');

        // Clear existing data
        await Promise.all([
            Organization.deleteMany({}),
            Admin.deleteMany({}),
            Volunteer.deleteMany({}),
            Citizen.deleteMany({}),
            Report.deleteMany({}),
            Assignment.deleteMany({})
        ]);
        console.log('🗑️  Cleared existing collections');

        // Seed organizations
        const orgs = await Organization.insertMany(orgsData);
        const orgIds = orgs.map(o => o._id);
        console.log(`✅ Seeded ${orgs.length} organizations`);

        // Seed admins (one per org)
        const adminsData = orgs.map((org, i) => ({
            name: `Admin ${org.city}`,
            email: `admin.${org.city.toLowerCase().replace(' ', '')}@saathi.com`,
            password: 'Admin@2026',
            organization: org._id,
            city: org.city,
            state: org.state
        }));
        const admins = await Admin.insertMany(adminsData);
        console.log(`✅ Seeded ${admins.length} admins`);
        console.log('   Admin credentials:');
        adminsData.forEach(a => console.log(`   📧 ${a.email} / ${a.password} → ${a.city}`));

        // Seed volunteers
        const vols = await Volunteer.insertMany(volunteersData(orgIds));
        const volIds = vols.map(v => v._id);
        console.log(`✅ Seeded ${vols.length} volunteers`);

        // Seed citizens
        const citizens = await Citizen.insertMany(citizensData);
        const citizenIds = citizens.map(c => c._id);
        console.log(`✅ Seeded ${citizens.length} citizens`);
        console.log('   Citizen credentials:');
        citizensData.forEach(c => console.log(`   👤 ${c.username} / ${c.password} → ${c.city}`));

        // Seed reports
        const reports = await Report.insertMany(reportsData(orgIds, citizenIds));
        const reportIds = reports.map(r => r._id);
        console.log(`✅ Seeded ${reports.length} reports`);

        // Seed assignments for assigned/in-progress reports
        const assignedReports = reports.filter(r => ['Assigned', 'In Progress', 'Resolved'].includes(r.status));
        const assignmentsData = [];
        for (const report of assignedReports) {
            // Find a volunteer from the same org or city
            const vol = vols.find(v =>
                (report.organization && v.organization && v.organization.toString() === report.organization.toString()) ||
                v.city === report.city
            ) || vols[0];

            const status = report.status === 'Resolved' ? 'Completed' : report.status === 'In Progress' ? 'Accepted' : 'Pending';
            assignmentsData.push({
                report: report._id,
                volunteer: vol._id,
                organization: report.organization,
                status,
                assignedAt: new Date(Date.now() - 3600000), // 1h ago
                acceptedAt: status !== 'Pending' ? new Date(Date.now() - 1800000) : null,
                completedAt: status === 'Completed' ? new Date(Date.now() - 600000) : null,
                completionNote: status === 'Completed' ? 'Issue resolved on-site.' : ''
            });
            // Also update the report's assignedVolunteers
            await Report.findByIdAndUpdate(report._id, { assignedVolunteers: [vol._id] });
        }
        await Assignment.insertMany(assignmentsData);
        console.log(`✅ Seeded ${assignmentsData.length} assignments`);

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('─────────────────────────────────────────────────────');
        console.log('ADMIN LOGINS (use on /login page):');
        adminsData.forEach(a => console.log(`  ✅ ${a.email} / Admin@2026  [${a.city}]`));
        console.log('\nVOLUNTEER LOGINS (use on /volunteer/login page):');
        volunteersData(orgIds).forEach(v => console.log(`  ✅ ${v.email} / ${DEMO_VOLUNTEER_PASSWORD}  [${v.city}]`));
        console.log('\nCITIZEN LOGINS (use on /citizen/login page):');
        citizensData.forEach(c => console.log(`  ✅ ${c.username} / Citizen@2026  [${c.city}]`));
        console.log('─────────────────────────────────────────────────────\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
