"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface TimerProps {
  duration: number
  onComplete: () => void
  isRunning: boolean
}

export default function Timer({ duration, onComplete, isRunning }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (!isRunning) {
      return
    }

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
    if (timeLeft === 0 && isRunning) {
      onComplete()
    }
  }, [timeLeft, isRunning, onComplete])

  const progress = timeLeft / duration
  const urgent = timeLeft <= 5 && timeLeft > 0
  // green -> amber -> red as time runs out
  const color = progress > 0.5 ? "#D0FF00" : progress > 0.25 ? "#FFC93C" : "#FF4D4D"

  return (
    <motion.div
      className="relative h-[clamp(7rem,11vw,11rem)] w-[clamp(7rem,11vw,11rem)]"
      animate={urgent ? { scale: [1, 1.07, 1] } : { scale: 1 }}
      transition={urgent ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
    >
      <svg className="h-full w-full -rotate-90 overflow-visible" viewBox="0 0 128 128">
        {/* Track */}
        <circle cx="64" cy="64" r="56" stroke="#0F4C44" strokeWidth="11" fill="none" />
        {/* Progress */}
        <motion.circle
          cx="64"
          cy="64"
          r="56"
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          pathLength={1}
          initial={false}
          animate={{ pathLength: progress }}
          transition={{ duration: 1, ease: "linear" }}
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={timeLeft}
          initial={{ scale: 1.35, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="font-black leading-none text-[clamp(2.5rem,4.5vw,4.5rem)]"
          style={{ color, textShadow: `0 0 18px ${color}66` }}
        >
          {timeLeft}
        </motion.span>
        <span className="mt-1 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-white/40">
          seg
        </span>
      </div>
    </motion.div>
  )
}
