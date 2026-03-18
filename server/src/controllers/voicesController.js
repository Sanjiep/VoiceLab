const prisma = require('../lib/prisma');

// Get all public voices
const getAllVoices = async (req, res) => {
  try {
    const voices = await prisma.voice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
    res.json({ success: true, count: voices.length, voices })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}

// Get single voice
const getVoiceById = async (req, res) => {
  try {
    const { id } = req.params
    const voice = await prisma.voice.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
    if (!voice) return res.status(404).json({ success: false, message: 'Voice not found' })
    res.json({ success: true, voice })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}

// Get my voices
const getMyVoices = async (req, res) => {
  try {
    const voices = await prisma.voice.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
    res.json({ success: true, count: voices.length, voices })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}

// Create a voice
const createVoice = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'Voice name is required' })
    const voice = await prisma.voice.create({
      data: { name, description, isPublic: isPublic || false, userId: req.user.userId },
      include: { user: { select: { name: true, email: true } } }
    })
    res.status(201).json({ success: true, message: 'Voice created successfully', voice })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}

// Delete a voice
const deleteVoice = async (req, res) => {
  try {
    const { id } = req.params
    const voice = await prisma.voice.findUnique({ where: { id } })
    if (!voice) return res.status(404).json({ success: false, message: 'Voice not found' })
    if (voice.userId !== req.user.userId) return res.status(403).json({ success: false, message: 'Not authorized' })
    await prisma.voice.delete({ where: { id } })
    res.json({ success: true, message: 'Voice deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: 'Something went wrong' })
  }
}

module.exports = { getAllVoices, getVoiceById, getMyVoices, createVoice, deleteVoice }