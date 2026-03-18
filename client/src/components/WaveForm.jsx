import { useEffect, useRef } from 'react'

export default function WaveForm({ audioRef, isPlaying, progress }) {
  const canvasRef = useRef(null)
  const barsRef = useRef([])

  // Generate random-looking but consistent bars from a seed
  useEffect(() => {
    const bars = []
    // 80 bars with pseudo-random heights for a natural waveform look
    for (let i = 0; i < 80; i++) {
      const x = Math.sin(i * 0.4) * 0.3 + Math.sin(i * 1.1) * 0.4 + Math.sin(i * 2.7) * 0.2 + 0.15
      bars.push(Math.max(0.08, Math.min(1, Math.abs(x))))
    }
    barsRef.current = bars
    draw(progress)
  }, [])

  useEffect(() => {
    draw(progress)
  }, [progress])

  const draw = (prog) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const bars = barsRef.current
    const barWidth = 2
    const gap = 2
    const total = barWidth + gap
    const centerY = height / 2
    const filledBars = Math.floor((prog / 100) * bars.length)

    bars.forEach((h, i) => {
      const x = i * total
      const barHeight = h * height * 0.85
      // Filled (played) = white, unfilled = white/25
      ctx.fillStyle = i < filledBars ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'
      ctx.beginPath()
      ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 1)
      ctx.fill()
    })
  }

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={40}
      className="flex-1 cursor-pointer"
      onClick={(e) => {
        if (!audioRef.current) return
        const rect = e.currentTarget.getBoundingClientRect()
        const pct = (e.clientX - rect.left) / rect.width
        audioRef.current.currentTime = pct * (audioRef.current.duration || 0)
      }}
    />
  )
}
