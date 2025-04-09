require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const authRoutes = require('./routes/auth');
const videoAnalysisRoutes = require('./routes/videoAnalysis');
const sequelize = require('./config/database');

const app = express();
let dbConnected = false;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://*.googleapis.com"]
        }
    }
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Routes with database dependency
// Add middleware to check db connection before hitting these routes
const requireDbConnection = (req, res, next) => {
    if (!dbConnected) {
        return res.status(503).json({ 
            message: 'Database connection not ready, please try again shortly'
        });
    }
    next();
};

app.use('/api/auth', requireDbConnection, authRoutes);
app.use('/api/analysis', requireDbConnection, videoAnalysisRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Start server first, then try to connect to database
const PORT = process.env.PORT || 8080;

// Start the server immediately to pass the health check
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
});

// Then try to connect to the database in the background
const connectToDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established');
        await sequelize.sync();
        dbConnected = true;
        console.log('Database synchronized');
    } catch (err) {
        console.error('Unable to connect to the database:', err);
        // Attempt to reconnect after a delay
        setTimeout(connectToDB, 5000);
    }
};

// Start the database connection process
connectToDB();

// Test deployment - checking Cloud Run deployment process

module.exports = app; 