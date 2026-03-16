const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { cloneVoice, getMyClonedVoices, deleteClonedVoice } = require('../controllers/cloneController');

// Setup multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audio/');
  },
  filename: (req, file, cb) => {
    cb(null, `clone-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.m4a', '.ogg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// All clone routes are protected
router.post('/create', authMiddleware, upload.single('audio'), cloneVoice);
router.get('/my-voices', authMiddleware, getMyClonedVoices);
router.delete('/:id', authMiddleware, deleteClonedVoice);

module.exports = router;