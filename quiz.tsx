"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Timer from "./timer"
import type { Question } from "./types"
import { Check } from "lucide-react"

const questions: { questions: Question[] } = require("./questions.json")

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => {
    const randomIndex = Math.floor(Math.random() * questions.questions.length)
    return questions.questions[randomIndex]
  })
  const [showAnswer, setShowAnswer] = useState(false)
  const [showFunFact, setShowFunFact] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [isBlinking, setIsBlinking] = useState(false)
  const correctButtonRef = useRef<HTMLButtonElement>(null)

  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false)
    setShowAnswer(true)
    setIsBlinking(true)

    // Stop blinking after 3 seconds (3 blinks)
    setTimeout(() => {
      setIsBlinking(false)
    }, 3000)
  }, [])

  useEffect(() => {
    if (showAnswer) {
      const timer = setTimeout(() => {
        setShowFunFact(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showAnswer])

  return (
    <div className="min-h-screen bg-[#0A322F] flex items-center justify-center p-4 font-sans antialiased text-[14px] sm:text-[16px] md:text-[18px]">
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .blink-animation {
          animation: blink 1s ease-in-out 3;
        }
      `}</style>
      <div className="w-full max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {!showFunFact ? (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center gap-8">
                <Timer duration={15} onComplete={handleTimerComplete} isRunning={isTimerRunning} />
                <span className="text-[#CCFF00] uppercase tracking-wider font-bold text-[0.875em]">
                  {currentQuestion.category}
                </span>
              </div>
              <h2 className="text-[#CCFF00] text-[1.75em] sm:text-[2em] md:text-[2.5em] font-extrabold text-center leading-tight">
                {currentQuestion.question}
              </h2>
              <div className="space-y-4 mt-8">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={option}
                    ref={index === currentQuestion.correctOption ? correctButtonRef : null}
                    className={`w-full p-4 rounded-2xl border-2 bg-[#0A322F] relative group transition-all duration-200
                      ${
                        showAnswer && index === currentQuestion.correctOption
                          ? `border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/10 ${isBlinking ? "blink-animation" : ""}`
                          : "border-[#CCFF00]/20 text-[#CCFF00] hover:border-[#CCFF00]/40"
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={showAnswer}
                  >
                    <span className="text-[1.25em] font-bold">{option}</span>
                    {showAnswer && index === currentQuestion.correctOption && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <Check className="w-[1.5em] h-[1.5em] text-[#CCFF00]" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="funfact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center relative min-h-[400px]"
            >
              <h3 className="text-[#CCFF00] text-[2em] sm:text-[2.5em] font-extrabold mb-8">Fun Fact</h3>
              <p className="text-[#CCFF00] text-[1.25em] sm:text-[1.5em] leading-relaxed font-medium">
                {currentQuestion.funFact}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

