require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const voicesRoutes = require('./routes/voices');
const ttsRoutes = require('./routes/tts');
const authRoutes = require('./routes/auth'); 
const userRoutes = require('./routes/user');
const cloneRoutes = require('./routes/clone');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(morgan('dev'));
app.use(express.json({ limit: `${config.maxAudioSize}mb` }));

// Routes
app.use('/api/v1/auth', authRoutes);  // ← add this
app.use('/api/v1/voices', voicesRoutes); 
app.use('/api/v1/tts', ttsRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/clone', cloneRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// Protected route test
app.get('/api/v1/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'You are authenticated!',
    user: req.user
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(config.port, () => {
  console.log(`🎙️ VoiceLab API: http://localhost:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});