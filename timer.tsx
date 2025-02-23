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

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 128 128">
        {/* Background circle */}
        <circle cx="64" cy="64" r="58" stroke="#0F4C44" strokeWidth="12" fill="none" className="opacity-50" />
        {/* Animated foreground circle */}
        <motion.path
          d="M64 6 A58 58 0 1 1 64 122 A58 58 0 1 1 64 6"
          fill="none"
          stroke="#CCFF00"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 1, pathOffset: 0 }}
          animate={{
            pathLength: timeLeft / duration,
            pathOffset: 1 - timeLeft / duration,
          }}
          transition={{ duration: 1, ease: "linear" }}
          className="drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[#CCFF00] text-5xl font-bold drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]">{timeLeft}</span>
      </div>
    </div>
  )
}

