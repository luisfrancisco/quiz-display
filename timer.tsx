"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

interface TimerProps {
  duration: number
  onComplete: () => void
  isRunning: boolean
}

/**
 * Sharp, editorial countdown: a big Bebas number over a 1px hairline track that
 * a teal bar drains across. Square corners, teal → amber → danger as time runs
 * out — on brand, glanceable from across the hall.
 */
export default function Timer({ duration, onComplete, isRunning }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!isRunning) return

    setTimeLeft(duration)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, duration])

  useEffect(() => {
    if (timeLeft === 0 && isRunning) onComplete()
  }, [timeLeft, isRunning, onComplete])

  const pct = timeLeft / duration
  const critical = timeLeft <= 3 && timeLeft > 0
  const urgent = timeLeft <= 5 && timeLeft > 0

  const barColor = critical ? "hsl(0 72% 51%)" : urgent ? "hsl(42 95% 55%)" : "hsl(174 72% 46%)"
  const numColor = critical ? "hsl(0 72% 51%)" : urgent ? "hsl(42 95% 55%)" : "hsl(180 10% 92%)"

  return (
    <motion.div
      className="flex flex-col items-end gap-[clamp(0.4rem,1vh,0.7rem)]"
      animate={urgent && !reduce ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
      transition={urgent && !reduce ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
    >
      <div className="flex items-baseline gap-2 leading-none">
        <span className="font-heading text-[clamp(0.65rem,1vw,0.85rem)] uppercase tracking-[0.3em] text-lime">
          tempo
        </span>
        <motion.span
          key={timeLeft}
          initial={reduce ? false : { y: -8, opacity: 0.4 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="font-heading text-[clamp(3rem,6vw,5.5rem)] leading-[0.8]"
          style={{ color: numColor }}
        >
          {timeLeft}
        </motion.span>
        <span className="font-heading text-[clamp(1rem,1.6vw,1.6rem)] uppercase text-fg-muted">s</span>
      </div>
      <div className="h-[4px] w-[clamp(9rem,18vw,17rem)] bg-hairline">
        <motion.div
          className="h-full origin-left"
          style={{ backgroundColor: barColor }}
          initial={false}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </div>
    </motion.div>
  )
}
