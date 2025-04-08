require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const videoAnalysisService = require('./services/videoAnalysis');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'self'", "https://www.youtube.com"],
            fontSrc: ["'self'", "cdnjs.cloudflare.com"],
        },
    },
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize services
videoAnalysisService.initialize().catch(console.error);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Video Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        
        if (!videoUrl) {
            return res.status(400).json({ error: 'Video URL is required' });
        }

        const result = await videoAnalysisService.analyzeVideo(videoUrl);
        res.json(result);
    } catch (error) {
        console.error('Error analyzing video:', error);
        res.status(500).json({ error: 'Error analyzing video' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 