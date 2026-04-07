const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('Environment Variables Check:');
console.log('- PORT:', process.env.PORT);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'MISSING');
console.log('- GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET (' + process.env.GROQ_API_KEY.substring(0, 5) + '...)' : 'MISSING');

// Routes
const reportRoutes = require('./routes/reportRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const activityRoutes = require('./routes/activity');
const dashboardRoutes = require('./routes/dashboardRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const impactRoutes = require('./routes/impact');
const routesRoutes = require('./routes/routes');
const plannerRoutes = require('./routes/planner');
const eventsRoutes = require('./routes/events');
const emergencyRoutes = require('./routes/emergency');
const authRoutes = require('./routes/authRoutes');
const orgRoutes = require('./routes/orgRoutes');
const communityRoutes = require('./routes/communityRoutes');

require('./jobs/updateImpactScores');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/whatsapp', whatsappRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/emergency', emergencyRoutes);

// WhatsApp webhook helpers
app.get('/whatsapp/webhook', (req, res) => {
    res.status(200).send('Saathi WhatsApp webhook is live. Use POST from Twilio.');
});
app.get('/whatsapp/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Saathi WhatsApp service is healthy' });
});

// Root
app.get('/', (req, res) => res.send('Saathi API is running...'));

// Error handling
app.use(errorHandler);

// ─── Database & Server Start ──────────────────────────────────────────────────
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.warn('MONGODB_URI is not set. Cannot start server properly.');
    process.exit(1);
} else {
    mongoose.connect(mongoUri)
        .then(() => {
            console.log('✅ MongoDB Atlas connected successfully');
            app.listen(PORT, () => {
                console.log(`🚀 Server is running on port ${PORT}`);
            });
        })
        .catch(err => {
            console.error('❌ MongoDB connection error:', err.message);
            console.warn('Starting server without MongoDB — data routes may fail.');
            app.listen(PORT, () => {
                console.log(`Server running (no DB) on port ${PORT}`);
            });
        });
}
