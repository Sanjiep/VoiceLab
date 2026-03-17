import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'

export default function History() {
  const [generations, setGenerations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/tts/history')
        setGenerations(res.data.generations)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tts/${id}`)
      setGenerations(generations.filter(g => g.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-purple-400">🎙️ History</h1>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-white mb-2">Generation History</h2>
        <p className="text-gray-400 mb-8">All your past audio generations</p>

        {loading ? (
          <p className="text-gray-400">Loading history...</p>
        ) : generations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No generations yet.</p>
            <Link to="/text-to-speech" className="text-purple-400 hover:text-purple-300 mt-2 block">
              Generate your first audio →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {generations.map(gen => (
              <div key={gen.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-medium">{gen.text}</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Voice: {gen.voice?.name} • {new Date(gen.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`http://localhost:3000${gen.audioUrl}`}
                      download
                      className="bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => handleDelete(gen.id)}
                      className="bg-gray-800 hover:bg-red-600 p-2 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {gen.audioUrl && (
                  <audio controls className="w-full mt-2">
                    <source src={`http://localhost:3000${gen.audioUrl}`} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}