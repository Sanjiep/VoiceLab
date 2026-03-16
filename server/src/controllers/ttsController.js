const prisma = require('../lib/prisma');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Generate TTS using ElevenLabs
const generateTTS = async (req, res) => {
  try {
    console.log('API KEY:', process.env.ELEVENLABS_API_KEY);
    const { text, voiceId } = req.body;

    // Validation
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    if (!voiceId) {
      return res.status(400).json({
        success: false,
        message: 'Voice ID is required'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Text must be under 5000 characters'
      });
    }

    // Check voice exists in our database
    const voice = await prisma.voice.findUnique({
      where: { id: voiceId }
    });

    if (!voice) {
      return res.status(404).json({
        success: false,
        message: 'Voice not found'
      });
    }

    // Save generation to database
    const generation = await prisma.generation.create({
      data: {
        userId: req.user.userId,
        voiceId,
        text,
        status: 'PROCESSING',
      }
    });

    // ElevenLabs default voice (Roger)
    const elevenLabsVoiceId = 'CwhRBWXzGAHq8TQ4Fs17';

    // Call ElevenLabs API
    const elevenLabsResponse = await axios({
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      data: {
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      },
      responseType: 'arraybuffer'
    });

    // Save audio file locally
    const uploadsDir = path.join(__dirname, '../../uploads/audio');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${generation.id}.mp3`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, elevenLabsResponse.data);

    const audioUrl = `/uploads/audio/${fileName}`;

    // Update generation in database
    const updatedGeneration = await prisma.generation.update({
      where: { id: generation.id },
      data: {
        audioUrl,
        status: 'COMPLETED',
        duration: text.length * 0.05,
      }
    });

    res.status(201).json({
      success: true,
      message: 'Audio generated successfully',
      generation: {
        id: updatedGeneration.id,
        text: updatedGeneration.text,
        audioUrl: updatedGeneration.audioUrl,
        duration: updatedGeneration.duration,
        status: updatedGeneration.status,
        createdAt: updatedGeneration.createdAt,
      }
    });

  } catch (error) {
    console.error('TTS generate error:', error.message);

    // Update generation status to FAILED
    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      error: error.message
    });
  }
};

// Get TTS history
const getHistory = async (req, res) => {
  try {
    const generations = await prisma.generation.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        voice: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      count: generations.length,
      generations
    });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// Delete a generation
const deleteGeneration = async (req, res) => {
  try {
    const { id } = req.params;

    const generation = await prisma.generation.findUnique({
      where: { id }
    });

    if (!generation) {
      return res.status(404).json({
        success: false,
        message: 'Generation not found'
      });
    }

    if (generation.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this generation'
      });
    }

    await prisma.generation.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Generation deleted successfully'
    });

  } catch (error) {
    console.error('Delete generation error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = { generateTTS, getHistory, deleteGeneration };