import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  Sun, Moon, Globe, Headphones,
  LogOut, User, ChevronDown,
  Settings, CreditCard, Share,
} from "lucide-react";

const pageTitles = {
  "/dashboard": "Home",
  "/voices": "My Voices",
  "/discovery": "Discovery",
  "/text-to-speech": "Text to Speech",
  "/voice-cloning": "Voice Cloning",
  "/history": "History",
  "/billing": "Billing",
  "/whats-new": "What's New",
  "/settings": "Settings",
};

export default function Navbar({ onLogoutClick }) {
  const location = useLocation();
  const { dark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showAccount, setShowAccount] = useState(false);
  const accountRef = useRef(null);

  const title = pageTitles[location.pathname] || "VoiceLab";

    // Close account dropdown on outside click
    useEffect(() => {
  const handleClickOutside = (e) => {
    if (accountRef.current && !accountRef.current.contains(e.target)) {
      setShowAccount(false)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])
  

  return (
    <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 dark:border-[#1f1f1f] bg-white dark:bg-[#0a0a0a] sticky top-0 z-30">

      {/* Page title */}
      <h1 className="text-lg font-medium text-gray-900 dark:text-white">
        {title}
      </h1>

      {/* Right icons */}
      <div className="flex items-center gap-1">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
          title={dark ? "Light mode" : "Dark mode"}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Language */}
        <button
          className="p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
          title="Language (coming soon)"
        >
          <Globe size={16} />
        </button>

        {/* Discord */}
        <a
          href="https://discord.gg"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
          title="Discord"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.033.05a19.97 19.97 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
          </svg>
        </a>

        {/* Support */}
        <a
          href="mailto:support@voicelab.com"
          className="p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
          title="Support"
        >
          <Headphones size={16} />
        </a>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-100 dark:bg-white/10 mx-1" />

        {/* Account circle */}
        <div className="relative" ref={accountRef}>
          <button
            onClick={() => setShowAccount(!showAccount)}
            className="flex items-center gap-1.5 px-1.5 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-white dark:border-white/20 bg-gray-100 dark:bg-white/10" />
              <div className="absolute inset-1 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
            <ChevronDown
              size={13}
              className={`text-gray-400 dark:text-white/30 transition-transform ${showAccount ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {showAccount && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl shadow-lg overflow-hidden z-50">

              {/* User info + credits */}
              <div className="p-3 border-b border-gray-100 dark:border-[#2a2a2a]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || "User"}
                  </p>
                  <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/50 px-2 py-0.5 rounded-full">
                    Free Plan
                  </span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400 dark:text-white/30">Credits Remaining</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-white/60">46 / 8,000</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5">
                    <div
                      className="bg-gray-700 dark:bg-white/40 h-1.5 rounded-full"
                      style={{ width: `${(46 / 8000) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-white/25 mt-1.5">
                    Next refresh — Apr 2, 2026
                  </p>
                </div>
              </div>

              {/* Nav links */}
              <div className="p-1 border-b border-gray-100 dark:border-[#2a2a2a]">
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition"
                  onClick={() => setShowAccount(false)}
                >
                  <User size={14} /> My Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition"
                  onClick={() => setShowAccount(false)}
                >
                  <Settings size={14} /> Settings
                </Link>
                <Link
                  to="/billing"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition"
                  onClick={() => setShowAccount(false)}
                >
                  <CreditCard size={14} /> Plans
                </Link>
              </div>

              {/* Extra links */}
              <div className="p-1 border-b border-gray-100 dark:border-[#2a2a2a]">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition">
                  <Globe size={14} />
                  <span>Language</span>
                  <span className="ml-auto text-xs text-gray-300 dark:text-white/20">Soon</span>
                </button>
                <a
                  href="mailto:support@voicelab.com"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition"
                  onClick={() => setShowAccount(false)}
                >
                  <Headphones size={14} />
                  <span>Help & Support</span>
                </a>
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition">
                  <Share size={14} />
                  <span>Share VoiceLab</span>
                </button>
              </div>

              {/* Logout */}
              <div className="p-1">
                <button
                  onClick={() => {
                    setShowAccount(false)
                    onLogoutClick()
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}