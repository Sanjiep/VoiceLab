import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { ArrowLeft, Mic, Download } from 'lucide-react'

export default function TextToSpeech() {
  const [text, setText] = useState('')
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await api.get('/voices')
        setVoices(res.data.voices)
        const voiceIdFromUrl = searchParams.get('voiceId')
        if (voiceIdFromUrl) {
          setSelectedVoice(voiceIdFromUrl)
        } else if (res.data.voices.length > 0) {
          setSelectedVoice(res.data.voices[0].id)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchVoices()
  }, [])

  const handleGenerate = async () => {
    if (!text.trim()) return setError('Please enter some text')
    if (!selectedVoice) return setError('Please select a voice')
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post('/tts/generate', {
        text,
        voiceId: selectedVoice
      })
      setResult(res.data.generation)
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-purple-400">🎙️ Text to Speech</h1>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-white mb-2">Text to Speech</h2>
        <p className="text-gray-400 mb-8">Convert your text to natural-sounding audio</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Voice selector */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Select Voice</label>
          <select
            value={selectedVoice}
            onChange={e => setSelectedVoice(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
          >
            {voices.map(voice => (
              <option key={voice.id} value={voice.id}>{voice.name}</option>
            ))}
          </select>
        </div>

        {/* Text input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            Your Text
            <span className="ml-2 text-gray-500">{text.length}/5000</span>
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={5000}
            rows={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
            placeholder="Enter the text you want to convert to speech..."
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 transition disabled:opacity-50 text-lg"
        >
          <Mic size={22} />
          {loading ? 'Generating audio...' : 'Generate Speech'}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white">Generated Audio</h3>
              <a
                href={`http://localhost:3000${result.audioUrl}`}
                download
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition"
              >
                <Download size={16} /> Download
              </a>
            </div>
            <audio controls className="w-full">
              <source src={`http://localhost:3000${result.audioUrl}`} type="audio/mpeg" />
            </audio>
            <p className="text-gray-400 text-sm mt-3">
              Duration: {result.duration?.toFixed(1)}s • Status: {result.status}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}