const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const reportRoutes = require('./routes/reportRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/reports', reportRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('VolunteerIQ API is running...');
});

// Error handling
app.use(errorHandler);

// Database Connection & Server Start
startServer();

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.warn('MONGODB_URI is not set. Running in local fallback mode without MongoDB.');
} else {
    mongoose.connect(mongoUri)
        .then(() => {
            console.log('MongoDB connected successfully');
        })
        .catch(err => {
            console.error('MongoDB connection error:', err);
            console.warn('Backend is running without a MongoDB connection. Data routes may fail until MongoDB is available.');
        });
}
