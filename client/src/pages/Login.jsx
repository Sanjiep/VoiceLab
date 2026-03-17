import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Home } from "lucide-react";
import api from "../utils/api";

const phrases = [
  { tag: "excited", text: "Welcome to the future of voice AI." },
  { tag: "confident", text: "Clone any voice in seconds." },
  { tag: "calm", text: "Natural speech, powered by AI." },
  { tag: "energetic", text: "Turn text into studio-quality audio." },
  { tag: "warm", text: "Your voice, everywhere you need it." },
  { tag: "professional", text: "Build the next generation of voice apps." },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const { login, token } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % phrases.length);
        setVisible(true);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const current = phrases[phraseIndex];

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* ── Left Side (desktop only) ── */}
      <div className="hidden lg:flex w-1/2 flex-col p-14 relative border-r border-gray-100 dark:border-[#1f1f1f] bg-gray-950 dark:bg-black">
        {/* Animated gradient background */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: "rgba(120, 80, 255, 0.12)",
              filter: "blur(80px)",
              top: "-100px",
              left: "-100px",
              animation: "orb1 10s ease-in-out infinite alternate",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background: "rgba(80, 160, 255, 0.1)",
              filter: "blur(80px)",
              bottom: "-100px",
              right: "-100px",
              animation: "orb2 12s ease-in-out infinite alternate",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "rgba(255, 80, 180, 0.08)",
              filter: "blur(80px)",
              top: "50%",
              left: "30%",
              animation: "orb3 14s ease-in-out infinite alternate",
            }}
          />
        </div>
        {/* Logo */}
        <div className="mb-auto">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.svg" alt="VoiceLab" className="h-7 invert" />
            <span
              style={{
                fontFamily: "'Onest', sans-serif",
                fontWeight: 600,
                fontSize: "17px",
                color: "white",
                letterSpacing: "-0.3px",
              }}
            >
              VoiceLab
            </span>
          </Link>
        </div>

        {/* Rotating phrase */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-6">
            AI Voice Platform
          </p>
          <div
            style={{
              transition: "opacity 0.5s ease, transform 0.5s ease",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <p className="text-white/40 text-base mb-3">
              <span className="text-purple-400">[{current.tag}]</span>
            </p>
            <h2 className="text-white text-4xl font-light leading-tight">
              "{current.text}"
            </h2>
          </div>
          <p className="text-white/25 text-sm mt-8">↳ emotion tag support</p>
        </div>

        {/* Bottom stats */}
        <div className="flex gap-8 mt-auto pt-8 border-t border-[#1f1f1f]">
          <div>
            <p className="text-white text-xl font-semibold">10K+</p>
            <p className="text-white/30 text-xs mt-1">Voices generated</p>
          </div>
          <div>
            <p className="text-white text-xl font-semibold">30+</p>
            <p className="text-white/30 text-xs mt-1">Languages</p>
          </div>
          <div>
            <p className="text-white text-xl font-semibold">99%</p>
            <p className="text-white/30 text-xs mt-1">Satisfaction rate</p>
          </div>
        </div>
      </div>

      {/* ── Right Side ── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        {/* Top bar — mobile logo left + icons right / desktop icons right */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          {/* Mobile logo only */}
          <Link to="/" className="lg:hidden">
            <img
              src="/logo.svg"
              alt="VoiceLab"
              className={`h-8 ${dark ? "invert" : ""}`}
            />
          </Link>

          {/* Desktop spacer */}
          <div className="hidden lg:block" />

          {/* Icons — always on right */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              <Home size={18} />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm">
            <h1 className="text-gray-900 dark:text-white text-3xl font-semibold mb-1">
              Login to your account
            </h1>
            <p className="text-gray-400 dark:text-white/40 text-sm mb-8">
              Welcome back to VoiceLab
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition text-sm"
                placeholder="name@example.com"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-gray-400 dark:focus:border-white/40 transition text-sm"
                placeholder="Password"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-white/90 text-white dark:text-black font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="flex items-center justify-between mt-4 text-sm">
              <Link
                to="/register"
                className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition"
              >
                Sign up
              </Link>
              <a
                href="#"
                className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition"
              >
                Forgot password
              </a>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-[#2a2a2a]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white dark:bg-[#0a0a0a] text-gray-400 dark:text-white/30">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-[#2a2a2a] rounded-xl py-3 text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white transition text-sm font-medium">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
              <button className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-[#2a2a2a] rounded-xl py-3 text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white transition text-sm font-medium">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-white/20 mt-8">
              By clicking continue, you agree to our{" "}
              <a
                href="#"
                className="underline hover:text-gray-600 dark:hover:text-white/40"
              >
                Terms
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="underline hover:text-gray-600 dark:hover:text-white/40"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
