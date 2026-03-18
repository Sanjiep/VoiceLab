import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Mic,
  Compass,
  Type,
  Copy,
  History,
  CreditCard,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Database,
} from "lucide-react";

const navItems = [
  {
    section: null,
    items: [
      { icon: Home, label: "Home", path: "/dashboard" },
      { icon: Mic, label: "My Voices", path: "/voices" },
      { icon: Compass, label: "Discovery", path: "/discovery" },
    ],
  },
  {
    section: "Products",
    items: [
      { icon: Type, label: "Text to Speech", path: "/text-to-speech" },
      { icon: Copy, label: "Voice Cloning", path: "/voice-cloning" },
    ],
  },
  {
    section: "Platform",
    items: [
      { icon: History, label: "History", path: "/history" },
      { icon: CreditCard, label: "Billing", path: "/billing" },
      { icon: Sparkles, label: "What's New", path: "/whats-new" },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAccountPopup, setShowAccountPopup] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`
      fixed left-0 top-0 h-full z-40 flex flex-col
      bg-white dark:bg-[#111111]
      border-r border-gray-100 dark:border-[#1f1f1f]
      transition-all duration-300
      ${collapsed ? "w-16" : "w-56"}
    `}
    >
      {/* Logo + toggle */}
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && (
          <Link
            to="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <img src="/logo.svg" alt="VoiceLab" className="h-7 dark:invert" />
            <span
              style={{
                fontFamily: "'Onest', sans-serif",
                fontWeight: 700,
                fontSize: "15px",
              }}
              className="text-gray-900 dark:text-white"
            >
              VoiceLab
            </span>
          </Link>
        )}

        {collapsed && (
          <div className="mx-auto relative group">
            <Link to="/dashboard">
              <img
                src="/logo.svg"
                alt="VoiceLab"
                className="h-7 dark:invert group-hover:opacity-0 transition"
              />
            </Link>
            <button
              onClick={() => setCollapsed(false)}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
          </div>
        )}

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map((group, gi) => (
          <div key={gi} className="mb-4">
            {group.section && !collapsed && (
              <p className="text-xs text-gray-400 dark:text-white/25 uppercase tracking-widest px-3 mb-2">
                {group.section}
              </p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : ""}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition text-sm
                  ${
                    isActive(item.path)
                      ? "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium"
                      : "text-gray-500 dark:text-white/40 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="p-2">
        {!collapsed ? (
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition justify-center" title="Upgrade">
            <Database size={16} />
            Upgrade Now
          </button>
        ) : (
          <button
            className="w-full flex items-center justify-center py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition"
            title="Upgrade"
          >
            <Database size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
