const prisma = require('../lib/prisma');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// Clone a voice using ElevenLabs
const cloneVoice = async (req, res) => {
  try {
    const { name, description } = req.body;
    const audioFile = req.file;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Voice name is required'
      });
    }

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required'
      });
    }

    // Send to ElevenLabs for cloning
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('files', fs.createReadStream(audioFile.path), {
      filename: audioFile.originalname,
      contentType: audioFile.mimetype,
    });

    const elevenLabsResponse = await axios.post(
      'https://api.elevenlabs.io/v1/voices/add',
      formData,
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          ...formData.getHeaders(),
        }
      }
    );

    const elevenLabsVoiceId = elevenLabsResponse.data.voice_id;

    // Save cloned voice to database
    const voice = await prisma.voice.create({
      data: {
        name,
        description,
        isPublic: false,
        userId: req.user.userId,
        audioUrl: audioFile.path,
      }
    });

    // Clean up uploaded file
    fs.unlinkSync(audioFile.path);

    res.status(201).json({
      success: true,
      message: 'Voice cloned successfully!',
      voice: {
        id: voice.id,
        name: voice.name,
        description: voice.description,
        elevenLabsVoiceId,
        createdAt: voice.createdAt,
      }
    });

  } catch (error) {
    console.error('Clone voice error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Voice cloning failed',
      error: error.response?.data?.detail || error.message
    });
  }
};

// Get my cloned voices
const getMyClonedVoices = async (req, res) => {
  try {
    const voices = await prisma.voice.findMany({
      where: {
        userId: req.user.userId,
        isPublic: false,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: voices.length,
      voices
    });

  } catch (error) {
    console.error('Get cloned voices error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// Delete cloned voice
const deleteClonedVoice = async (req, res) => {
  try {
    const { id } = req.params;

    const voice = await prisma.voice.findUnique({
      where: { id }
    });

    if (!voice) {
      return res.status(404).json({
        success: false,
        message: 'Voice not found'
      });
    }

    if (voice.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this voice'
      });
    }

    await prisma.voice.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Cloned voice deleted successfully'
    });

  } catch (error) {
    console.error('Delete cloned voice error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = { cloneVoice, getMyClonedVoices, deleteClonedVoice };