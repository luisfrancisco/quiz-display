"use client"

/**
 * The table surface: a faint hex-tile grid (the board-game motif) lit by a
 * warm overhead "lamp" glow, with a touch of grain. Deliberately quiet — the
 * colored game components on top are what should carry the energy.
 */

// Pointy-top hex grid, generated once over a fixed 16:9 field and scaled to fit.
const W = 1920
const H = 1080
const R = 70 // hex radius

function hexPoints(cx: number, cy: number, r: number) {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 30)
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(" ")
}

const HEXES: { cx: number; cy: number }[] = []
const hStep = Math.sqrt(3) * R
const vStep = 1.5 * R
for (let row = -1; row * vStep < H + R; row++) {
  for (let col = -1; col * hStep < W + R; col++) {
    const cx = col * hStep + (row % 2 ? hStep / 2 : 0)
    const cy = row * vStep
    HEXES.push({ cx, cy })
  }
}

export default function QuizBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#15132A]">
      {/* Hex tile field */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <g fill="none" stroke="#A57BFF" strokeWidth="1.4" opacity="0.06">
          {HEXES.map((h, i) => (
            <polygon key={i} points={hexPoints(h.cx, h.cy, R)} />
          ))}
        </g>
      </svg>

      {/* Warm overhead lamplight */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_-8%,rgba(255,197,61,0.16),transparent_60%)]" />
      {/* Cool depth toward the floor */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_120%,rgba(31,199,174,0.10),transparent_55%)]" />
      {/* Edge falloff */}
      <div className="absolute inset-0 bg-[radial-gradient(130%_120%_at_50%_45%,transparent_50%,rgba(8,7,20,0.6)_100%)]" />

      {/* Fine grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04] mix-blend-overlay" aria-hidden>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  )
}
