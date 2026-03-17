export default function Logo({ dark = true, size = 'md' }) {
  const sizes = { sm: '14px', md: '18px', lg: '24px' }
  const heights = { sm: 'h-6', md: 'h-8', lg: 'h-10' }

  return (
    <div className="flex items-center gap-2">
      <img
        src="/logo.svg"
        alt="VoiceLab"
        className={`${heights[size]} ${dark ? 'invert' : ''}`}
      />
      <span style={{
        fontFamily: "'Onest', sans-serif",
        fontWeight: 500,
        fontSize: sizes[size],
        color: dark ? 'white' : 'black',
        letterSpacing: '-0.3px'
      }}>
        VoiceLab
      </span>
    </div>
  )
}