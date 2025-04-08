const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const { createCanvas, loadImage } = require('canvas');
const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const { Storage } = require('@google-cloud/storage');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

class VideoAnalysisService {
    constructor() {
        this.youtube = google.youtube('v3');
        this.predictionServiceClient = new PredictionServiceClient();
        this.storage = new Storage();
        this.bucketName = process.env.GCS_BUCKET_NAME;
        this.modelEndpoint = process.env.VERTEX_AI_ENDPOINT;
    }

    async initialize() {
        // No initialization needed for Vertex AI
        console.log('Vertex AI service initialized');
    }

    async analyzeVideo(videoUrl) {
        try {
            // Extract video ID
            const videoId = this.extractVideoId(videoUrl);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }

            // Get video details
            const videoDetails = await this.getVideoDetails(videoId);
            
            // Download video
            const videoPath = await this.downloadVideo(videoId);
            
            // Extract frames
            const frames = await this.extractFrames(videoPath);
            
            // Upload frames to GCS
            const gcsFrames = await this.uploadFramesToGCS(frames);
            
            // Analyze frames using Vertex AI
            const analysisResults = await this.analyzeFramesWithVertexAI(gcsFrames);
            
            // Clean up
            this.cleanup(videoPath);

            return {
                success: true,
                videoDetails,
                analysisResults
            };
        } catch (error) {
            console.error('Error in video analysis:', error);
            throw error;
        }
    }

    async getVideoDetails(videoId) {
        const response = await this.youtube.videos.list({
            part: 'snippet,contentDetails',
            id: videoId,
            key: process.env.YOUTUBE_API_KEY
        });

        return {
            title: response.data.items[0].snippet.title,
            duration: response.data.items[0].contentDetails.duration,
            description: response.data.items[0].snippet.description
        };
    }

    async downloadVideo(videoId) {
        // TODO: Implement video download using youtube-dl or similar
        // For now, return a placeholder
        return `/tmp/${videoId}.mp4`;
    }

    async extractFrames(videoPath) {
        return new Promise((resolve, reject) => {
            const frames = [];
            const outputDir = '/tmp/frames';
            
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }

            ffmpeg(videoPath)
                .on('end', () => {
                    resolve(frames);
                })
                .on('error', (err) => {
                    reject(err);
                })
                .screenshots({
                    timestamps: ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%'],
                    filename: 'frame-%i.png',
                    folder: outputDir
                });
        });
    }

    async uploadFramesToGCS(frames) {
        const gcsFrames = [];
        
        for (const frame of frames) {
            const fileName = path.basename(frame);
            const gcsPath = `frames/${fileName}`;
            
            await this.storage.bucket(this.bucketName).upload(frame, {
                destination: gcsPath
            });
            
            gcsFrames.push(`gs://${this.bucketName}/${gcsPath}`);
        }
        
        return gcsFrames;
    }

    async analyzeFramesWithVertexAI(gcsFrames) {
        const results = [];
        
        for (const frame of gcsFrames) {
            const request = {
                endpoint: this.modelEndpoint,
                instances: [{
                    content: frame
                }]
            };

            const [response] = await this.predictionServiceClient.predict(request);
            
            // Process the prediction results
            const prediction = response.predictions[0];
            const technique = this.analyzePrediction(prediction);
            
            results.push({
                frame,
                prediction,
                technique
            });
        }

        return results;
    }

    analyzePrediction(prediction) {
        // TODO: Implement BJJ technique recognition based on Vertex AI predictions
        // This would analyze the prediction results to identify:
        // - Guard positions
        // - Submissions
        // - Sweeps
        // - Takedowns
        // - Transitions
        
        return {
            type: 'unknown',
            confidence: prediction.confidence || 0
        };
    }

    cleanup(videoPath) {
        // Clean up temporary files
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
        }
        
        const framesDir = '/tmp/frames';
        if (fs.existsSync(framesDir)) {
            fs.readdirSync(framesDir).forEach(file => {
                fs.unlinkSync(path.join(framesDir, file));
            });
            fs.rmdirSync(framesDir);
        }
    }

    extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
}

module.exports = new VideoAnalysisService(); 