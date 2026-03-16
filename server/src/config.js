require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  fishSpeechUrl: process.env.FISH_SPEECH_URL,
  maxAudioSize: process.env.MAX_AUDIO_SIZE || 10,
};
