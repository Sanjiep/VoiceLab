import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  Type,
  Copy,
  Mic,
  Key,
  Play,
  Volume2,
  Clock,
  ArrowRight,
} from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const features = [
  {
    icon: Type,
    label: "Text to Speech",
    desc: "Convert any text to natural-sounding speech in seconds",
    path: "/text-to-speech",
    color: "bg-purple-100 dark:bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    orb1: "rgba(120, 80, 255, 0.15)",
    orb2: "rgba(180, 80, 255, 0.1)",
  },
  {
    icon: Copy,
    label: "Voice Cloning",
    desc: "Create a digital copy of any voice with our advanced AI",
    path: "/voice-cloning",
    color: "bg-blue-100 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    orb1: "rgba(80, 160, 255, 0.15)",
    orb2: "rgba(80, 80, 255, 0.1)",
  },
  {
    icon: Mic,
    label: "Voice Library",
    desc: "Browse and use from thousands of AI voices",
    path: "/voices",
    color: "bg-green-100 dark:bg-green-500/10",
    iconColor: "text-green-600 dark:text-green-400",
    orb1: "rgba(80, 200, 120, 0.15)",
    orb2: "rgba(80, 255, 160, 0.1)",
  },
  {
    icon: Clock,
    label: "History",
    desc: "View and download all your past generations",
    path: "/history",
    color: "bg-orange-100 dark:bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
    orb1: "rgba(255, 160, 80, 0.15)",
    orb2: "rgba(255, 80, 80, 0.1)",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalVoices: 0, totalGenerations: 0 });
  const [recentGenerations, setRecentGenerations] = useState([]);
  const [voices, setVoices] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, historyRes, voicesRes] = await Promise.all([
          api.get("/user/profile"),
          api.get("/tts/history"),
          api.get("/voices"),
        ]);
        setStats(profileRes.data.user.stats);
        setApiKey(profileRes.data.user.apiKey);
        setRecentGenerations(historyRes.data.generations.slice(0, 4));
        setVoices(voicesRes.data.voices.slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-1">
            {getGreeting()}, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-gray-400 dark:text-white/40 text-sm">
            Here's what's happening with your VoiceLab today.
          </p>
        </div>

        {/* Features grid */}
        <div className="mb-10">
          <h2 className="text-xs font-medium text-gray-400 dark:text-white/30 uppercase tracking-widest mb-4">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Link
                key={f.path}
                to={f.path}
                className="group relative bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-5 hover:border-gray-200 dark:hover:border-white/20 hover:shadow-sm transition overflow-hidden"
              >
                {/* Animated orb background — shows on hover */}
                <div className="absolute inset-0 opacity-100 overflow-hidden rounded-2xl">
                  <div
                    style={{
                      position: "absolute",
                      width: "200px",
                      height: "200px",
                      borderRadius: "50%",
                      background: f.orb1,
                      filter: "blur(40px)",
                      top: "-50px",
                      right: "-50px",
                      animation: "orb1 6s ease-in-out infinite alternate",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      background: f.orb2,
                      filter: "blur(40px)",
                      bottom: "-30px",
                      left: "-30px",
                      animation: "orb2 8s ease-in-out infinite alternate",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div
                    className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <f.icon size={20} className={f.iconColor} />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    {f.label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/30 leading-relaxed">
                    {f.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-gray-400 dark:text-white/30 group-hover:text-gray-600 dark:group-hover:text-white/50 transition">
                    <span>Open</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* My Voices + Recent Generations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* My Voices */}
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-medium text-gray-900 dark:text-white">
                My Voices
              </h2>
              <Link
                to="/voices"
                className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-50 dark:bg-white/5 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : voices.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mic size={22} className="text-gray-300 dark:text-white/20" />
                </div>
                <p className="text-sm text-gray-400 dark:text-white/30 mb-3">
                  No voices yet
                </p>
                <Link
                  to="/voice-cloning"
                  className="text-xs text-purple-500 hover:text-purple-600 font-medium"
                >
                  Clone your first voice →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {voices.map((voice) => (
                  <div
                    key={voice.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {voice.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {voice.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                        {voice.description || "Custom voice"}
                      </p>
                    </div>
                    <Link
                      to={`/text-to-speech?voiceId=${voice.id}`}
                      className="opacity-0 group-hover:opacity-100 text-xs text-purple-500 hover:text-purple-600 transition font-medium"
                    >
                      Use
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Generations */}
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Recent Generations
              </h2>
              <Link
                to="/history"
                className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white transition flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-50 dark:bg-white/5 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : recentGenerations.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Volume2
                    size={22}
                    className="text-gray-300 dark:text-white/20"
                  />
                </div>
                <p className="text-sm text-gray-400 dark:text-white/30 mb-3">
                  No generations yet
                </p>
                <Link
                  to="/text-to-speech"
                  className="text-xs text-purple-500 hover:text-purple-600 font-medium"
                >
                  Generate your first audio →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentGenerations.map((gen) => (
                  <div
                    key={gen.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition group"
                  >
                    <div className="w-9 h-9 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 transition">
                      <Play
                        size={14}
                        className="text-gray-400 dark:text-white/30 group-hover:text-purple-500 transition"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {gen.text}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                        {gen.voice?.name} •{" "}
                        {new Date(gen.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        gen.status === "COMPLETED"
                          ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                          : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/30"
                      }`}
                    >
                      {gen.status === "COMPLETED" ? "Done" : gen.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* API Key */}
        <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Key size={16} className="text-gray-400 dark:text-white/30" />
              <h2 className="font-medium text-gray-900 dark:text-white">
                API Key
              </h2>
            </div>
            <span className="text-xs text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
              Keep this secret
            </span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl px-4 py-3">
            <Key
              size={14}
              className="text-gray-300 dark:text-white/20 flex-shrink-0"
            />
            <code className="text-xs text-gray-500 dark:text-white/40 flex-1 truncate">
              {apiKey}
            </code>
            <button
              onClick={copyApiKey}
              className={`text-xs font-medium flex-shrink-0 px-3 py-1.5 rounded-lg transition ${
                copied
                  ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/20"
              }`}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
