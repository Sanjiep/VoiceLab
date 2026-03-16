const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        apiKey: true,
        createdAt: true,
        _count: {
          select: {
            voices: true,
            generations: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        apiKey: user.apiKey,
        createdAt: user.createdAt,
        stats: {
          totalVoices: user._count.voices,
          totalGenerations: user._count.generations,
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// Regenerate API key
const regenerateApiKey = async (req, res) => {
  try {
    const newApiKey = uuidv4().replace(/-/g, '');

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { apiKey: newApiKey },
      select: { apiKey: true }
    });

    res.json({
      success: true,
      message: 'API key regenerated successfully',
      apiKey: user.apiKey
    });

  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = { getProfile, regenerateApiKey, updateProfile };