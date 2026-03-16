require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: `${config.maxAudioSize}mb` }));

// Health endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'VoiceLab API is running 🎙️',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.listen(config.port, () => {
  console.log(`🚀 VoiceLab API: http://localhost:${config.port}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
});
