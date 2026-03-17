import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}