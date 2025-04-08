const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
require('dotenv').config({ path: '.env.test' });

// Mock Vertex AI prediction results
const mockPrediction = {
    predictions: [{
        keypoints: [
            { x: 0.5, y: 0.3, score: 0.9, name: 'nose' },
            { x: 0.6, y: 0.4, score: 0.85, name: 'left_shoulder' },
            { x: 0.4, y: 0.4, score: 0.87, name: 'right_shoulder' }
        ],
        confidence: 0.85,
        technique: 'guard'
    }]
};

jest.mock('@google-cloud/aiplatform', () => ({
    PredictionServiceClient: jest.fn().mockImplementation(() => ({
        predict: jest.fn().mockResolvedValue([mockPrediction])
    }))
}));

jest.mock('@google-cloud/storage', () => ({
    Storage: jest.fn().mockImplementation(() => ({
        bucket: jest.fn().mockReturnValue({
            upload: jest.fn().mockResolvedValue([{}])
        })
    }))
}));

const videoAnalysisService = require('../services/videoAnalysis');

describe('VideoAnalysisService', () => {
    let testDir;
    let testFile;
    let testFrame;

    beforeAll(async () => {
        try {
            // Create test directory
            testDir = path.join(__dirname, 'test-frames');
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }

            // Create test file
            testFile = path.join(testDir, 'test.txt');
            fs.writeFileSync(testFile, 'test content');

            // Create test frame
            testFrame = path.join(testDir, 'test-frame.png');
            const canvas = createCanvas(640, 480);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 640, 480);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(testFrame, buffer);

            await videoAnalysisService.initialize();
        } catch (error) {
            console.error('Setup error:', error);
            throw error;
        }
    }, 30000);

    afterAll(async () => {
        try {
            await videoAnalysisService.cleanup();
            
            // Clean up test files
            if (fs.existsSync(testFile)) {
                fs.unlinkSync(testFile);
            }
            if (fs.existsSync(testFrame)) {
                fs.unlinkSync(testFrame);
            }
            if (fs.existsSync(testDir)) {
                fs.rmdirSync(testDir);
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });

    test('extractVideoId should correctly parse YouTube URLs', () => {
        const testCases = [
            {
                url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                expected: 'dQw4w9WgXcQ'
            },
            {
                url: 'https://youtu.be/dQw4w9WgXcQ',
                expected: 'dQw4w9WgXcQ'
            },
            {
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                expected: 'dQw4w9WgXcQ'
            },
            {
                url: 'invalid-url',
                expected: null
            }
        ];

        testCases.forEach(({ url, expected }) => {
            expect(videoAnalysisService.extractVideoId(url)).toBe(expected);
        });
    });

    test('getVideoDetails should return video information', async () => {
        if (!process.env.YOUTUBE_API_KEY) {
            console.warn('YouTube API key not set. Skipping getVideoDetails test.');
            return;
        }

        try {
            const videoId = 'dQw4w9WgXcQ';
            const details = await videoAnalysisService.getVideoDetails(videoId);
            
            expect(details).toHaveProperty('title');
            expect(details).toHaveProperty('duration');
            expect(details).toHaveProperty('description');
        } catch (error) {
            if (error.message.includes('API key not valid')) {
                console.warn('Invalid YouTube API key. Skipping test.');
                return;
            }
            throw error;
        }
    }, 10000);

    test('analyzeFramesWithVertexAI should process frames correctly', async () => {
        if (!fs.existsSync(testFrame)) {
            throw new Error('Test frame not created during setup');
        }

        const frames = [testFrame];
        const gcsFrames = await videoAnalysisService.uploadFramesToGCS(frames);
        const results = await videoAnalysisService.analyzeFramesWithVertexAI(gcsFrames);
        
        expect(Array.isArray(results)).toBe(true);
        expect(results[0]).toHaveProperty('frame');
        expect(results[0]).toHaveProperty('prediction');
        expect(results[0].prediction).toEqual(mockPrediction.predictions[0]);
        expect(results[0]).toHaveProperty('technique');
    }, 10000);

    test('cleanup should remove temporary files', async () => {
        const cleanupFile = path.join(testDir, 'cleanup-test.txt');
        fs.writeFileSync(cleanupFile, 'test content');
        
        await videoAnalysisService.cleanup(cleanupFile);
        
        expect(fs.existsSync(cleanupFile)).toBe(false);
    });
}); 