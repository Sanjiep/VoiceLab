import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";
import {
  Mic,
  Download,
  ChevronDown,
  Loader,
  Check,
  Heart,
  Bookmark,
  Share2,
  Plus,
  X,
  Search,
  History,
  Settings2,
  User,
  Sun,
  Moon,
} from "lucide-react";

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false);
  const [showVoicePopup, setShowVoicePopup] = useState(false);
  const [voiceTab, setVoiceTab] = useState("my");
  const [voiceSearch, setVoiceSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);
  const [error, setError] = useState("");
  const [likedVoices, setLikedVoices] = useState([]);
  const [bookmarkedVoices, setBookmarkedVoices] = useState([]);
  const [activePanel, setActivePanel] = useState("settings");
  const [history, setHistory] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [userCredits] = useState(4792);
  const [searchParams] = useSearchParams();
  const { dark, toggleTheme } = useTheme();
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const maxChars = 5000;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [voicesRes, historyRes] = await Promise.all([
          api.get("/voices"),
          api.get("/tts/history"),
        ]);
        setVoices(voicesRes.data.voices);
        setHistory(historyRes.data.generations.slice(0, 20));
        const voiceIdFromUrl = searchParams.get("voiceId");
        if (voiceIdFromUrl) {
          const v = voicesRes.data.voices.find((v) => v.id === voiceIdFromUrl);
          setSelectedVoice(v || voicesRes.data.voices[0]);
        } else if (voicesRes.data.voices.length > 0) {
          setSelectedVoice(voicesRes.data.voices[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Load audio as blob to prevent auto-download
  useEffect(() => {
    if (!result?.audioUrl) return;
    const loadAudio = async () => {
      try {
        const response = await fetch(`http://localhost:3000${result.audioUrl}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
      } catch (err) {
        console.error("Failed to load audio:", err);
      }
    };
    loadAudio();
    return () => {
      if (audioSrc) URL.revokeObjectURL(audioSrc);
    };
  }, [result]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowVoiceDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return setError("Please enter some text");
    if (!selectedVoice) return setError("Please select a voice");
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setLoading(true);
    setError("");
    setResult(null);
    setAudioSrc(null);
    try {
      const res = await api.post("/tts/generate", {
        text,
        voiceId: selectedVoice.id,
      });
      setResult(res.data.generation);
      setHistory((prev) => [res.data.generation, ...prev.slice(0, 19)]);
    } catch (err) {
      setError(err.response?.data?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (audioUrl, filename = "voicelab-audio.mp3") => {
    try {
      const response = await fetch(`http://localhost:3000${audioUrl}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleDeleteHistory = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/tts/${deleteConfirm.id}`);
      setHistory((prev) => prev.filter((h) => h.id !== deleteConfirm.id));
      if (result?.id === deleteConfirm.id) {
        setResult(null);
        setAudioSrc(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const toggleLike = (id) =>
    setLikedVoices((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );

  const toggleBookmark = (id) =>
    setBookmarkedVoices((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );

  const filteredVoices = voices.filter((v) =>
    v.name.toLowerCase().includes(voiceSearch.toLowerCase()),
  );

  const groupedHistory = history.reduce((acc, gen) => {
    const d = new Date(gen.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    let label;
    if (d.toDateString() === today.toDateString()) label = "Today";
    else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
    else
      label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    if (!acc[label]) acc[label] = [];
    acc[label].push(gen);
    return acc;
  }, {});

  const voiceTabs = [
    { id: "my", label: "My Voices" },
    { id: "bookmarked", label: "Bookmarked" },
    { id: "recent", label: "Recent" },
    { id: "discover", label: "Discover" },
  ];

  return (
    <Layout>
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* ── Left Panel ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Voice Dropdown */}
          <div className="px-6 pt-5 pb-3 relative" ref={dropdownRef}>
            <button
              onClick={() => setShowVoiceDropdown((prev) => !prev)}
              className="flex items-center gap-3 bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-xl px-4 py-2.5 hover:border-gray-200 dark:hover:border-white/20 transition"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {selectedVoice?.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedVoice?.name || "Select a voice"}
              </span>
              <ChevronDown
                size={15}
                className={`text-gray-400 dark:text-white/30 ml-1 transition-transform duration-200 ${showVoiceDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {showVoiceDropdown && (
              <div className="absolute top-full left-6 mt-1 w-72 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-[#2a2a2a]">
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-1.5">
                    <Search
                      size={13}
                      className="text-gray-400 dark:text-white/30"
                    />
                    <input
                      type="text"
                      value={voiceSearch}
                      onChange={(e) => setVoiceSearch(e.target.value)}
                      placeholder="Search voices..."
                      className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {filteredVoices.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-white/30 text-center py-6">
                      No voices found
                    </p>
                  ) : (
                    filteredVoices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => {
                          setSelectedVoice(voice);
                          setShowVoiceDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition text-left ${selectedVoice?.id === voice.id ? "bg-gray-50 dark:bg-white/5" : ""}`}
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            {voice.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {voice.name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-white/30 truncate">
                            {voice.description || "Custom voice"}
                          </p>
                        </div>
                        {selectedVoice?.id === voice.id && (
                          <Check
                            size={14}
                            className="text-gray-900 dark:text-white flex-shrink-0"
                          />
                        )}
                      </button>
                    ))
                  )}
                </div>
                <div className="border-t border-gray-100 dark:border-[#2a2a2a] px-3 py-2">
                  <button
                    onClick={() => {
                      setShowVoiceDropdown(false);
                      setShowVoicePopup(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition rounded-xl hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <Plus size={13} /> Browse all voices
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Textarea */}
          <div className="flex-1 px-6 pb-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={maxChars}
              className="w-full h-full bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-200 dark:focus:border-white/20 resize-none text-sm leading-relaxed transition"
              placeholder="Start typing or paste your text here..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-500 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="px-6 pb-5 flex items-center justify-between gap-4">
            {/* Credits */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-white/20 flex items-center justify-center">
                <span className="text-[9px] font-bold text-gray-400 dark:text-white/30">
                  C
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-white/40">
                <span className="text-gray-700 dark:text-white/70 font-medium">
                  {userCredits.toLocaleString()}
                </span>{" "}
                credits remaining
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${text.length > maxChars * 0.9 ? "text-red-500" : "text-gray-400 dark:text-white/30"}`}
              >
                {text.length.toLocaleString()} / {maxChars.toLocaleString()}
              </span>
              <button
                onClick={() => result && handleDownload(result.audioUrl)}
                disabled={!result}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                title="Download audio"
              >
                <Download size={16} />
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading || !text.trim() || !selectedVoice}
                className="flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-white/90 text-white dark:text-black font-semibold px-5 py-2.5 rounded-2xl transition disabled:opacity-40 text-sm"
              >
                {loading ? (
                  <>
                    <Loader size={15} className="animate-spin" /> Generating...
                  </>
                ) : result ? (
                  <>
                    <Mic size={15} /> Regenerate
                  </>
                ) : (
                  <>
                    <Mic size={15} /> Generate speech
                  </>
                )}
              </button>
            </div>
          </div>
          {/* Audio Player — appears after generation */}
          {result && audioSrc && (
            <div className="mx-6 mb-3 bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={() => {
                    if (!audioRef.current) return;
                    if (isPlaying) {
                      audioRef.current.pause();
                      setIsPlaying(false);
                    } else {
                      audioRef.current.play();
                      setIsPlaying(true);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0 hover:opacity-80 transition"
                >
                  {isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-white dark:text-black"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-white dark:text-black ml-0.5"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>

                {/* Time */}
                <span className="text-xs text-gray-400 dark:text-white/30 w-8 flex-shrink-0 tabular-nums">
                  {Math.floor(currentTime / 60)}:
                  {String(Math.floor(currentTime % 60)).padStart(2, "0")}
                </span>

                {/* Progress bar */}
                <div
                  className="flex-1 h-1 bg-gray-100 dark:bg-white/10 rounded-full cursor-pointer relative group"
                  onClick={(e) => {
                    if (!audioRef.current || !duration) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    audioRef.current.currentTime = pct * duration;
                  }}
                >
                  <div
                    className="h-1 bg-gray-900 dark:bg-white rounded-full transition-all relative"
                    style={{
                      width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  >
                    {/* Scrubber dot */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-900 dark:bg-white opacity-0 group-hover:opacity-100 transition shadow-sm" />
                  </div>
                </div>

                {/* Duration */}
                <span className="text-xs text-gray-400 dark:text-white/30 w-8 flex-shrink-0 tabular-nums">
                  {Math.floor(duration / 60)}:
                  {String(Math.floor(duration % 60)).padStart(2, "0")}
                </span>

                {/* Download */}
                <button
                  onClick={() => handleDownload(result.audioUrl)}
                  className="p-1.5 rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition flex-shrink-0"
                  title="Download"
                >
                  <Download size={14} />
                </button>
              </div>

              {/* Hidden audio element */}
              <audio
                ref={audioRef}
                src={audioSrc}
                onTimeUpdate={() =>
                  setCurrentTime(audioRef.current?.currentTime || 0)
                }
                onLoadedMetadata={() =>
                  setDuration(audioRef.current?.duration || 0)
                }
                onEnded={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div className="w-72 flex flex-col border-l border-gray-100 dark:border-[#1f1f1f] bg-gray-50 dark:bg-[#0d0d0d]">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-[#1f1f1f]">
            {[
              { id: "settings", icon: Settings2, label: "Settings" },
              { id: "history", icon: History, label: "History" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActivePanel(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition border-b-2 ${
                  activePanel === id
                    ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                    : "border-transparent text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* Settings Panel */}
          {activePanel === "settings" && (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Voice Card */}
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-white/30 uppercase tracking-widest mb-3">
                  Voice
                </p>
                {selectedVoice ? (
                  <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-base font-bold">
                          {selectedVoice.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {selectedVoice.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-white/20 flex items-center justify-center flex-shrink-0">
                            <User
                              size={9}
                              className="text-gray-500 dark:text-white/50"
                            />
                          </div>
                          <p className="text-xs text-gray-400 dark:text-white/30 truncate">
                            {selectedVoice.user?.name || "You"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setShowVoicePopup(true)}
                          className="p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition"
                          title="Change voice"
                        >
                          <ChevronDown size={14} className="-rotate-90" />
                        </button>
                        <button
                          onClick={() => setSelectedVoice(null)}
                          className="p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                          title="Remove voice"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Voice actions */}
                    <div className="flex items-center gap-3 px-4 pb-3 border-t border-gray-50 dark:border-white/5 pt-2.5">
                      <button
                        onClick={() => toggleLike(selectedVoice.id)}
                        className={`flex items-center gap-1 text-xs transition ${likedVoices.includes(selectedVoice.id) ? "text-red-500" : "text-gray-400 dark:text-white/30"}`}
                      >
                        <Heart
                          size={13}
                          fill={
                            likedVoices.includes(selectedVoice.id)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                      <span className="text-gray-200 dark:text-white/10">
                        ·
                      </span>
                      <button
                        onClick={() => toggleBookmark(selectedVoice.id)}
                        className={`flex items-center gap-1 text-xs transition ${bookmarkedVoices.includes(selectedVoice.id) ? "text-purple-500" : "text-gray-400 dark:text-white/30"}`}
                      >
                        <Bookmark
                          size={13}
                          fill={
                            bookmarkedVoices.includes(selectedVoice.id)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                      <span className="text-gray-200 dark:text-white/10">
                        ·
                      </span>
                      <button className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/30 transition">
                        <Plus size={13} />
                      </button>
                      <span className="text-gray-200 dark:text-white/10">
                        ·
                      </span>
                      <button className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/30 transition">
                        <Share2 size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowVoicePopup(true)}
                    className="w-full border border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-6 text-xs text-gray-400 dark:text-white/30 hover:border-gray-300 dark:hover:border-white/20 transition"
                  >
                    + Select a voice
                  </button>
                )}
              </div>

              {/* Model */}
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-white/30 uppercase tracking-widest mb-3">
                  Model
                </p>
                <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#1f1f1f] rounded-xl px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Eleven Turbo v2.5
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                    Fast, high quality
                  </p>
                </div>
              </div>

              {/* Voice Settings */}
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-white/30 uppercase tracking-widest mb-3">
                  Voice Settings
                </p>
                <div className="space-y-4">
                  {[
                    {
                      label: "Stability",
                      value: 50,
                      hint: "More variable ← → More stable",
                    },
                    { label: "Similarity", value: 75 },
                    { label: "Style", value: 0 },
                  ].map(({ label, value, hint }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs text-gray-500 dark:text-white/40">
                          {label}
                        </label>
                        <span className="text-xs text-gray-400 dark:text-white/30">
                          {value}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue={value}
                        className="w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-gray-700 dark:accent-white"
                      />
                      {hint && (
                        <p className="text-xs text-gray-300 dark:text-white/20 mt-1">
                          {hint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History Panel */}
          {activePanel === "history" && (
            <div className="flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <History
                    size={28}
                    className="text-gray-200 dark:text-white/10 mx-auto mb-2"
                  />
                  <p className="text-xs text-gray-400 dark:text-white/30">
                    No history yet
                  </p>
                </div>
              ) : (
                Object.entries(groupedHistory).map(([label, items]) => (
                  <div key={label}>
                    <div className="px-4 py-2 mt-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white/80">
                        {label}
                      </span>
                    </div>
                    {items.map((gen) => (
                      <div
                        key={gen.id}
                        className="relative px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 transition group cursor-pointer"
                        onClick={() => setResult(gen)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="text-gray-500 dark:text-white/50 ml-0.5"
                            >
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 dark:text-white/80 truncate leading-snug">
                              {gen.text}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex-shrink-0" />
                              <p className="text-xs text-gray-400 dark:text-white/30 truncate">
                                {gen.voice?.name ||
                                  selectedVoice?.name ||
                                  "Voice"}
                              </p>
                            </div>
                          </div>
                          <div
                            className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                gen.audioUrl && handleDownload(gen.audioUrl)
                              }
                              className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10 transition"
                            >
                              <Download size={13} />
                            </button>
                            <div
                              className="relative"
                              ref={openMenuId === gen.id ? menuRef : null}
                            >
                              <button
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === gen.id ? null : gen.id,
                                  )
                                }
                                className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-200 dark:hover:bg-white/10 transition"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <circle cx="12" cy="5" r="1.5" />
                                  <circle cx="12" cy="12" r="1.5" />
                                  <circle cx="12" cy="19" r="1.5" />
                                </svg>
                              </button>
                              {openMenuId === gen.id && (
                                <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                                  <button
                                    onClick={() => {
                                      setText(gen.text);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                                  >
                                    Restore text
                                  </button>
                                  <button
                                    onClick={() => setOpenMenuId(null)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                                  >
                                    <Share2
                                      size={15}
                                      className="text-gray-400 dark:text-white/30"
                                    />{" "}
                                    Share
                                  </button>
                                  <div className="my-1 border-t border-gray-100 dark:border-white/5" />
                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setDeleteConfirm(gen);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Voice Browse Popup ── */}
      {showVoicePopup && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={() => setShowVoicePopup(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-2xl max-h-[80vh] flex flex-col bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a]">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Select Voice
              </h2>
              <button
                onClick={() => setShowVoicePopup(false)}
                className="p-1.5 rounded-lg text-gray-400 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex border-b border-gray-100 dark:border-[#2a2a2a] px-4">
              {voiceTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setVoiceTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition ${voiceTab === tab.id ? "border-gray-900 dark:border-white text-gray-900 dark:text-white" : "border-transparent text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="px-5 py-3 border-b border-gray-100 dark:border-[#2a2a2a]">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2">
                <Search
                  size={14}
                  className="text-gray-400 dark:text-white/30"
                />
                <input
                  type="text"
                  value={voiceSearch}
                  onChange={(e) => setVoiceSearch(e.target.value)}
                  placeholder="Search voices..."
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {filteredVoices.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-400 dark:text-white/30">
                    No voices found
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredVoices.map((voice) => (
                    <div
                      key={voice.id}
                      onClick={() => {
                        setSelectedVoice(voice);
                        setShowVoicePopup(false);
                      }}
                      className={`relative bg-gray-50 dark:bg-white/5 border rounded-2xl p-4 cursor-pointer transition hover:border-gray-300 dark:hover:border-white/30 ${selectedVoice?.id === voice.id ? "border-gray-900 dark:border-white" : "border-gray-100 dark:border-white/10"}`}
                    >
                      {selectedVoice?.id === voice.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center">
                          <Check
                            size={11}
                            className="text-white dark:text-black"
                          />
                        </div>
                      )}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center mb-3">
                        <span className="text-white text-lg font-bold">
                          {voice.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">
                        {voice.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-white/30 mb-3">
                        {voice.description || "Custom voice"}
                      </p>
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => toggleLike(voice.id)}
                          className={`p-1.5 rounded-lg transition hover:bg-white dark:hover:bg-white/10 ${likedVoices.includes(voice.id) ? "text-red-500" : "text-gray-300 dark:text-white/20"}`}
                        >
                          <Heart
                            size={13}
                            fill={
                              likedVoices.includes(voice.id)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                        <button
                          onClick={() => toggleBookmark(voice.id)}
                          className={`p-1.5 rounded-lg transition hover:bg-white dark:hover:bg-white/10 ${bookmarkedVoices.includes(voice.id) ? "text-purple-500" : "text-gray-300 dark:text-white/20"}`}
                        >
                          <Bookmark
                            size={13}
                            fill={
                              bookmarkedVoices.includes(voice.id)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                        <button className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/50 hover:bg-white dark:hover:bg-white/10 transition">
                          <Plus size={13} />
                        </button>
                        <button className="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/50 hover:bg-white dark:hover:bg-white/10 transition">
                          <Share2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between">
              <p className="text-xs text-gray-400 dark:text-white/30">
                {filteredVoices.length} voices available
              </p>
              <button
                onClick={() => setShowVoicePopup(false)}
                className="text-xs text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
            onClick={() => !deleting && setDeleteConfirm(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-sm bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-2xl shadow-2xl p-6">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white text-center mb-2">
              Delete this generation?
            </h3>
            <p className="text-sm text-gray-400 dark:text-white/30 text-center mb-1 px-2 truncate">
              "{deleteConfirm.text?.slice(0, 55)}
              {deleteConfirm.text?.length > 55 ? "..." : ""}"
            </p>
            <p className="text-xs text-red-400 text-center mb-6">
              This can't be recovered once deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteHistory}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  "Yes, delete"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
