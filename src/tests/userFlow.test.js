const axios = require('axios');
require('dotenv').config();

const API_URL = 'https://bjj-coach-781030252850.us-central1.run.app/api';

async function testUserFlow() {
  try {
    // 1. Register a new user
    console.log('1. Registering new user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email: `test${Date.now()}@example.com`,
      password: 'test123',
      firstName: 'Test',
      lastName: 'User'
    });
    console.log('Registration successful:', registerResponse.data);

    // 2. Login
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: registerResponse.data.user.email,
      password: 'test123'
    });
    const token = loginResponse.data.token;
    console.log('Login successful');

    // 3. Submit a video for analysis
    console.log('\n3. Submitting video for analysis...');
    const videoResponse = await axios.post(
      `${API_URL}/analysis/submit`,
      {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example video
        videoType: 'training',
        notes: 'Test submission'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    const analysisId = videoResponse.data.analysisId;
    console.log('Video submitted successfully:', videoResponse.data);

    // 4. Check analysis status
    console.log('\n4. Checking analysis status...');
    const statusResponse = await axios.get(
      `${API_URL}/analysis/${analysisId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    console.log('Analysis status:', statusResponse.data);

    console.log('\nUser flow test completed successfully!');
  } catch (error) {
    console.error('Error in user flow test:', error.response?.data || error.message);
  }
}

testUserFlow(); 