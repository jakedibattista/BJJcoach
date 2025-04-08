const express = require('express');
const router = express.Router();
const videoAnalysisController = require('../controllers/videoAnalysisController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Submit a new video for analysis
router.post('/submit', videoAnalysisController.submitVideo);

// Get a specific analysis
router.get('/:analysisId', videoAnalysisController.getAnalysis);

// Get all analyses for the current user
router.get('/', videoAnalysisController.getUserAnalyses);

module.exports = router; 