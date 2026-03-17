import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Mic, ArrowLeft } from 'lucide-react'

export default function Voices() {
  const [voices, setVoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await api.get('/voices')
        setVoices(res.data.voices)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchVoices()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-purple-400">🎙️ Voice Library</h1>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-white mb-2">Voice Library</h2>
        <p className="text-gray-400 mb-8">Browse and use available voices</p>

        {loading ? (
          <p className="text-gray-400">Loading voices...</p>
        ) : voices.length === 0 ? (
          <div className="text-center py-20">
            <Mic size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No voices yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voices.map(voice => (
              <div key={voice.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Mic size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{voice.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(voice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {voice.description && (
                  <p className="text-gray-400 text-sm mt-2">{voice.description}</p>
                )}
                <Link
                  to={`/text-to-speech?voiceId=${voice.id}`}
                  className="mt-4 block text-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm transition"
                >
                  Use this voice
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}