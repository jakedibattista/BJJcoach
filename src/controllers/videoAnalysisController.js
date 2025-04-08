const { analyzeVideo } = require('../services/videoAnalysis');
const VideoAnalysis = require('../models/VideoAnalysis');

const videoAnalysisController = {
  async submitVideo(req, res) {
    try {
      const { videoUrl, videoType, notes } = req.body;
      const userId = req.user.id;

      // Create video analysis record
      const analysis = await VideoAnalysis.create({
        userId,
        videoUrl,
        videoType,
        notes,
        status: 'pending'
      });

      // Start analysis in background
      analyzeVideo(analysis.id, videoUrl)
        .then(async (result) => {
          await analysis.update({
            status: 'completed',
            analysisResult: result
          });
        })
        .catch(async (error) => {
          console.error('Video analysis error:', error);
          await analysis.update({
            status: 'failed',
            errorMessage: error.message
          });
        });

      res.status(202).json({
        message: 'Video analysis started',
        analysisId: analysis.id
      });
    } catch (error) {
      console.error('Submit video error:', error);
      res.status(500).json({ message: 'Error submitting video for analysis' });
    }
  },

  async getAnalysis(req, res) {
    try {
      const { analysisId } = req.params;
      const userId = req.user.id;

      const analysis = await VideoAnalysis.findOne({
        where: {
          id: analysisId,
          userId
        }
      });

      if (!analysis) {
        return res.status(404).json({ message: 'Analysis not found' });
      }

      res.json(analysis);
    } catch (error) {
      console.error('Get analysis error:', error);
      res.status(500).json({ message: 'Error retrieving analysis' });
    }
  },

  async getUserAnalyses(req, res) {
    try {
      const userId = req.user.id;
      const analyses = await VideoAnalysis.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']]
      });

      res.json(analyses);
    } catch (error) {
      console.error('Get user analyses error:', error);
      res.status(500).json({ message: 'Error retrieving analyses' });
    }
  }
};

module.exports = videoAnalysisController; 