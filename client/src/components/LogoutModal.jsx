import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'

export default function LogoutModal({ show, onCancel }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  if (!show) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onCancel}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-sm px-4">
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl shadow-2xl p-6">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <LogOut size={22} className="text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-1">
            Logout
          </h3>
          <p className="text-sm text-gray-400 dark:text-white/40 text-center mb-6">
            Are you sure you want to logout from VoiceLab?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}