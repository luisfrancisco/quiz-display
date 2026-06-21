"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

interface TimerProps {
  duration: number
  onComplete: () => void
  isRunning: boolean
}

/**
 * A round-track countdown: one pip per second arranged in a ring, extinguishing
 * clockwise — like the round marker creeping around a Euro-game scoring track.
 * You can read the exact seconds left from across the hall by counting lit pips.
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

  const urgent = timeLeft <= 5 && timeLeft > 0
  const litColor = urgent ? "#F6B23D" : "#29C6B0"
  const numColor = urgent ? "#F6B23D" : "#ECF1F0"

  const cx = 56
  const cy = 56
  const ringR = 46
  const pips = Array.from({ length: duration })

  return (
    <motion.div
      className="relative h-[clamp(7rem,11vw,10rem)] w-[clamp(7rem,11vw,10rem)]"
      animate={urgent && !reduce ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={urgent && !reduce ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
    >
      <svg className="h-full w-full overflow-visible" viewBox="0 0 112 112" aria-hidden>
        {pips.map((_, i) => {
          const lit = i < timeLeft
          const a = (Math.PI / 180) * (-90 + i * (360 / duration))
          const x = cx + ringR * Math.cos(a)
          const y = cy + ringR * Math.sin(a)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={lit ? 5 : 3.4}
              fill={lit ? litColor : "#22323A"}
              style={lit ? { filter: `drop-shadow(0 0 5px ${litColor}aa)` } : undefined}
            />
          )
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={timeLeft}
          initial={reduce ? false : { scale: 1.3, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="font-display font-extrabold leading-none text-[clamp(2.5rem,4.2vw,4rem)]"
          style={{ color: numColor }}
        >
          {timeLeft}
        </motion.span>
        <span className="-mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.35em] text-white/35">seg</span>
      </div>
    </motion.div>
  )
}
