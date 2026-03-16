const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllVoices,
  getVoiceById,
  getMyVoices,
  createVoice,
  deleteVoice
} = require('../controllers/voicesController');

// Public routes
router.get('/', getAllVoices);
router.get('/:id', getVoiceById);

// Protected routes (need login)
router.get('/my/voices', authMiddleware, getMyVoices);
router.post('/', authMiddleware, createVoice);
router.delete('/:id', authMiddleware, deleteVoice);

module.exports = router;