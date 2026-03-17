import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Mic, History, Music, LogOut, Key } from 'lucide-react'
import Logo from '../components/Logo'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalVoices: 0, totalGenerations: 0 })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile')
        setStats(res.data.user.stats)
      } catch (err) {
        console.error(err)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <img src="/logo-white.svg" alt="VoiceLab" className="h-8" />
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Hello, {user?.name || user?.email}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
        <p className="text-gray-400 mb-8">Welcome to VoiceLab — your AI voice platform</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Voices</p>
            <p className="text-4xl font-bold text-white mt-1">{stats.totalVoices}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm">Total Generations</p>
            <p className="text-4xl font-bold text-white mt-1">{stats.totalGenerations}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link to="/text-to-speech" className="bg-purple-600 hover:bg-purple-700 rounded-xl p-6 flex items-center gap-4 transition">
            <Mic size={28} />
            <div>
              <p className="font-semibold">Text to Speech</p>
              <p className="text-sm text-purple-200">Generate audio from text</p>
            </div>
          </Link>
          <Link to="/voices" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-6 flex items-center gap-4 transition">
            <Music size={28} />
            <div>
              <p className="font-semibold">Voice Library</p>
              <p className="text-sm text-gray-400">Browse all voices</p>
            </div>
          </Link>
          <Link to="/history" className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-6 flex items-center gap-4 transition">
            <History size={28} />
            <div>
              <p className="font-semibold">History</p>
              <p className="text-sm text-gray-400">Past generations</p>
            </div>
          </Link>
        </div>

        {/* API Key */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Key size={18} className="text-purple-400" />
            <h3 className="font-semibold text-white">Your API Key</h3>
          </div>
          <code className="text-purple-300 bg-gray-800 px-4 py-2 rounded-lg text-sm block">
            {user?.apiKey}
          </code>
        </div>
      </div>
    </div>
  )
}