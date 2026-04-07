const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Report = require('./models/Report');
const Volunteer = require('./models/Volunteer');
const Organization = require('./models/Organization');
const Citizen = require('./models/Citizen');
const Assignment = require('./models/Assignment');

console.log('Environment Variables Check:');
console.log('- PORT:', process.env.PORT);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'MISSING');
console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET (' + process.env.GROQ_API_KEY.substring(0, 5) + '...)' : 'MISSING');

const reportRoutes = require('./routes/reportRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const impactRoutes = require('./routes/impact');
const routesRoutes = require('./routes/routes');
const plannerRoutes = require('./routes/planner');
const organizationRoutes = require('./routes/organizationRoutes');
const citizenRoutes = require('./routes/citizenRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

require('./jobs/updateImpactScores');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

let serverStarted = false;

const startServer = () => {
    if (serverStarted) {
        return;
    }

    serverStarted = true;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// Routes
app.use('/api/reports', reportRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/whatsapp', whatsappRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/citizens', citizenRoutes);
app.use('/api/assignments', assignmentRoutes);

app.get('/whatsapp/webhook', (req, res) => {
    res.status(200).send('Saathi WhatsApp webhook is live. Use POST from Twilio.');
});

app.get('/whatsapp/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Saathi WhatsApp service is healthy',
    });
});

// Seed sample data for testing location filtering
app.post('/api/seed', async (req, res) => {
    try {
        const { organizations, volunteers, citizens, reports } = require('./seedTenantData');
        
        // Clear existing data
        await Promise.all([
            require('./models/Organization').deleteMany({}),
            require('./models/Citizen').deleteMany({}),
            Volunteer.deleteMany({}),
            require('./models/Assignment').deleteMany({}),
            Report.deleteMany({})
        ]);

        const Organization = require('./models/Organization');
        const Citizen = require('./models/Citizen');

        const createdOrganizations = await Organization.insertMany(organizations);
        const createdCitizens = await Citizen.insertMany(citizens);
        const createdVolunteers = await Volunteer.insertMany(volunteers);
        
        // Seed reports
        const createdReports = await Report.insertMany(reports);

        res.json({
            success: true,
            message: 'Sample data seeded successfully',
            organizations: createdOrganizations.length,
            citizens: createdCitizens.length,
            volunteers: createdVolunteers.length,
            reports: createdReports.length
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed data',
            error: error.message
        });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('Saathi API is running...');
});

// Error handling
app.use(errorHandler);

// Database Connection & Server Start
startServer();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.warn('MONGODB_URI is not set. Running in local fallback mode without MongoDB.');
} else {
    const mongoOptions = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        family: 4,
    };
    
    mongoose.connect(mongoUri, mongoOptions)
        .then(() => {
            console.log('MongoDB connected successfully');
        })
        .catch(err => {
            console.error('MongoDB connection error:', err.message);
            console.warn('Backend is running without a MongoDB connection. Data routes may fail until MongoDB is available.');
        });
}
