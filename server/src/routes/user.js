const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getProfile, regenerateApiKey, updateProfile } = require('../controllers/userController');

// All user routes are protected
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/api-key/regenerate', authMiddleware, regenerateApiKey);

module.exports = router;