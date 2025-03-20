require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 8080;

// Security middleware with less restrictive configuration
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/', (req, res) => {
  try {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="icon" href="data:,">
          <title>BJJ Coach</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 20px;
                  background-color: #f5f5f5;
              }
              .container {
                  max-width: 800px;
                  margin: 0 auto;
                  background-color: white;
                  padding: 20px;
                  border-radius: 10px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 {
                  color: #2c3e50;
                  text-align: center;
                  margin-bottom: 30px;
              }
              .feature-list {
                  list-style: none;
                  padding: 0;
              }
              .feature-list li {
                  background-color: #3498db;
                  color: white;
                  margin: 10px 0;
                  padding: 15px;
                  border-radius: 5px;
                  text-align: center;
                  cursor: pointer;
                  transition: background-color 0.3s;
              }
              .feature-list li:hover {
                  background-color: #2980b9;
              }
              .coming-soon {
                  text-align: center;
                  color: #7f8c8d;
                  margin-top: 20px;
                  font-style: italic;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>🥋 BJJ Coach</h1>
              <ul class="feature-list">
                  <li>Technique Library</li>
                  <li>Training Log</li>
                  <li>Competition Tracker</li>
                  <li>Belt Progress</li>
              </ul>
              <p class="coming-soon">More features coming soon!</p>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving homepage:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 