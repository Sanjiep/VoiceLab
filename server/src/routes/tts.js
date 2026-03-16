const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { generateTTS, getHistory, deleteGeneration } = require('../controllers/ttsController');

// All TTS routes are protected
router.post('/generate', authMiddleware, generateTTS);
router.get('/history', authMiddleware, getHistory);
router.delete('/:id', authMiddleware, deleteGeneration);

module.exports = router;