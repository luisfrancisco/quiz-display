"use client"

import { motion } from "framer-motion"

/* ---- Board-game glyphs ---------------------------------------------------- */

function Meeple({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <path d="M32 4c-5 0-8 3.5-8 8 0 2.4 1 4.4 2.6 5.8-3.4 1.2-7.6 2.6-12 4-3.4 1.1-5.6 2.6-5.6 5.2 0 2.4 2 4 4.6 4 2.2 0 5-.7 8-1.6-2.2 6-4.4 12.4-5.4 16.2C15 56 16.8 60 21 60c2.8 0 4.6-1.7 6-4.4L32 46l5 9.6c1.4 2.7 3.2 4.4 6 4.4 4.2 0 6-4 4.4-8.4-1-3.8-3.2-10.2-5.4-16.2 3 .9 5.8 1.6 8 1.6 2.6 0 4.6-1.6 4.6-4 0-2.6-2.2-4.1-5.6-5.2-4.4-1.4-8.6-2.8-12-4C39 16.4 40 14.4 40 12c0-4.5-3-8-8-8z" />
    </svg>
  )
}

function Dice({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect x="6" y="6" width="52" height="52" rx="12" stroke="currentColor" strokeWidth="4" />
      <circle cx="20" cy="20" r="4.5" fill="currentColor" />
      <circle cx="44" cy="20" r="4.5" fill="currentColor" />
      <circle cx="32" cy="32" r="4.5" fill="currentColor" />
      <circle cx="20" cy="44" r="4.5" fill="currentColor" />
      <circle cx="44" cy="44" r="4.5" fill="currentColor" />
    </svg>
  )
}

function Hexagon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path d="M32 4 56 18v28L32 60 8 46V18z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  )
}

function Spade({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <path d="M32 6C24 16 10 24 10 36c0 7 5 11 11 11 3 0 5.6-1.2 7-3-1 6-3 9-6 12h20c-3-3-5-6-6-12 1.4 1.8 4 3 7 3 6 0 11-4 11-11C54 24 40 16 32 6z" />
    </svg>
  )
}

function Pawn({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor">
      <path d="M32 6a10 10 0 0 0-6.6 17.5C22 26 20 30 20 34c0 3.4 1.8 5.4 4.4 7.6L20 56h24l-4.4-14.4c2.6-2.2 4.4-4.2 4.4-7.6 0-4-2-8-5.4-10.5A10 10 0 0 0 32 6z" />
    </svg>
  )
}

const GLYPHS = [Meeple, Dice, Hexagon, Spade, Pawn]

/* Deterministic layout (no Math.random) to stay SSR-safe. */
const FLOATERS = [
  { x: "6%", y: "16%", size: 88, glyph: 0, dur: 17, delay: 0, rot: 18 },
  { x: "84%", y: "10%", size: 72, glyph: 1, dur: 21, delay: 1.5, rot: -22 },
  { x: "16%", y: "72%", size: 110, glyph: 2, dur: 24, delay: 0.8, rot: 14 },
  { x: "90%", y: "66%", size: 96, glyph: 3, dur: 19, delay: 2.2, rot: -16 },
  { x: "73%", y: "82%", size: 64, glyph: 4, dur: 23, delay: 0.4, rot: 20 },
  { x: "44%", y: "8%", size: 56, glyph: 1, dur: 26, delay: 1.1, rot: -12 },
  { x: "30%", y: "40%", size: 48, glyph: 0, dur: 20, delay: 2.8, rot: 24 },
  { x: "62%", y: "44%", size: 52, glyph: 2, dur: 22, delay: 0.2, rot: -18 },
]

export default function QuizBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base gradient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,#0f4a43_0%,#0a322f_45%,#05201d_100%)]" />

      {/* Soft lime glows */}
      <motion.div
        className="absolute -left-32 top-0 h-[55vh] w-[55vh] rounded-full bg-[#D0FF00]/10 blur-[120px]"
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-0 h-[50vh] w-[50vh] rounded-full bg-[#36e0c4]/10 blur-[120px]"
        animate={{ opacity: [0.5, 0.3, 0.5], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(#D0FF00 1.5px, transparent 1.5px)",
          backgroundSize: "42px 42px",
        }}
      />

      {/* Floating board-game glyphs */}
      {FLOATERS.map((f, i) => {
        const Glyph = GLYPHS[f.glyph]
        return (
          <motion.div
            key={i}
            className="absolute text-[#D0FF00]/[0.07]"
            style={{ left: f.x, top: f.y, width: f.size, height: f.size }}
            animate={{ y: [0, -26, 0], rotate: [f.rot, -f.rot, f.rot] }}
            transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            <Glyph className="h-full w-full" />
          </motion.div>
        )
      })}

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_50%,transparent_55%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  )
}
