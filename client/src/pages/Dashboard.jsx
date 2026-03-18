import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import Layout from '../components/Layout'
import { Type, Copy, Mic, Key, ChevronRight, Play } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ totalVoices: 0, totalGenerations: 0 })
  const [recentGenerations, setRecentGenerations] = useState([])
  const [apiKey, setApiKey] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/tts/history'),
        ])
        setStats(profileRes.data.user.stats)
        setApiKey(profileRes.data.user.apiKey)
        setRecentGenerations(historyRes.data.generations.slice(0, 5))
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Layout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
            Home
          </h1>
          <p className="text-gray-400 dark:text-white/40 text-sm">
            Welcome back to VoiceLab
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/text-to-speech" className="group bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-6 hover:border-gray-200 dark:hover:border-white/20 transition">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Type size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">Text to Speech</p>
                <p className="text-sm text-gray-400 dark:text-white/40">Convert text to natural audio</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 dark:text-white/20 group-hover:text-gray-500 dark:group-hover:text-white/40 transition" />
            </div>
          </Link>

          <Link to="/voice-cloning" className="group bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-6 hover:border-gray-200 dark:hover:border-white/20 transition">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Copy size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">Voice Cloning</p>
                <p className="text-sm text-gray-400 dark:text-white/40">Clone any voice instantly</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 dark:text-white/20 group-hover:text-gray-500 dark:group-hover:text-white/40 transition" />
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Voices', value: stats.totalVoices },
            { label: 'Generations', value: stats.totalGenerations },
            { label: 'Languages', value: '30+' },
            { label: 'Plan', value: 'Free' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-5">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-400 dark:text-white/40 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent generations */}
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-medium text-gray-900 dark:text-white">Recent Generations</h2>
              <Link to="/history" className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white transition">
                View all →
              </Link>
            </div>
            {recentGenerations.length === 0 ? (
              <div className="text-center py-8">
                <Mic size={32} className="text-gray-200 dark:text-white/10 mx-auto mb-3" />
                <p className="text-sm text-gray-400 dark:text-white/30">No generations yet</p>
                <Link to="/text-to-speech" className="text-xs text-purple-500 hover:text-purple-600 mt-2 block">
                  Generate your first audio →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentGenerations.map(gen => (
                  <div key={gen.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition group">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Play size={14} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm text-gray-900 dark:text-white truncate">{gen.text}</p>
                      <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                        {new Date(gen.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs text-gray-300 dark:text-white/20 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                      {gen.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* API Key */}
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Key size={18} className="text-gray-400 dark:text-white/30" />
              <h2 className="font-medium text-gray-900 dark:text-white">API Key</h2>
            </div>
            <p className="text-sm text-gray-400 dark:text-white/40 mb-4">
              Use this key to access VoiceLab API from your applications.
            </p>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl px-4 py-3 mb-3">
              <code className="text-xs text-gray-600 dark:text-white/50 flex-1 truncate">
                {apiKey}
              </code>
              <button
                onClick={copyApiKey}
                className="text-xs text-purple-500 hover:text-purple-600 font-medium flex-shrink-0"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-white/25">
              Keep this key secret. Don't share it publicly.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  )
}