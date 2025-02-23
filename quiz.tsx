"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Timer from "./timer"
import type { Question } from "./types"
import { Check } from "lucide-react"

const questions: { questions: Question[] } = require("./questions.json")

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions.questions[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * questions.questions.length)
    setCurrentQuestion(questions.questions[randomIndex])
  }, []);

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
      // Show fun fact after blinking stops
      setShowFunFact(true)
    }, 5000)
  }, [])

  useEffect(() => {
    if (showFunFact) {
      const timer = setTimeout(() => {
        // Reset all states and get a new random question
        setShowFunFact(false)
        setShowAnswer(false)
        setIsTimerRunning(true)
        setIsBlinking(false)

        let randomIndex
        do {
          randomIndex = Math.floor(Math.random() * questions.questions.length)
        } while (questions.questions[randomIndex].question === currentQuestion.question)

        setCurrentQuestion(questions.questions[randomIndex])
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showFunFact, currentQuestion])

  return (
    <div className="min-h-screen bg-[#0a322f] flex items-center justify-center p-4 font-['Poppins'] antialiased text-[14px] sm:text-[16px] md:text-[18px]">
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .blink-animation {
          animation: blink .5s ease-in-out 3;
        }
      `}</style>
      <div className="w-full max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {!showFunFact ? (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center gap-6">
                <Timer duration={15} onComplete={handleTimerComplete} isRunning={isTimerRunning} />
                <span className="mt-8 text-[#D0FF00] uppercase tracking-[0.1em] font-medium text-[0.875em]">
                  {currentQuestion.category}
                </span>
              </div>
              <h2 className="text-[#D0FF00] text-[1.75em] sm:text-[2em] md:text-[3.25em] font-bold text-center leading-tight mb-12">
                {currentQuestion.question}
              </h2>
              <div className="pt-8 space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={option}
                    ref={index === currentQuestion.correctOption ? correctButtonRef : null}
                    className={`w-full p-4 rounded-2xl border-2 relative group transition-all duration-200 flex items-center justify-between
                      ${
                        showAnswer && index === currentQuestion.correctOption
                          ? `border-[#D0FF00] bg-[#D0FF00] ${isBlinking ? "blink-animation" : ""}`
                          : "border-[#D0FF00]/20 text-[#D0FF00] hover:border-[#D0FF00]/40 bg-transparent"
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={showAnswer}
                  >
                    <span className={`text-[1.725em] font-medium ${
                      showAnswer && index === currentQuestion.correctOption
                        ? "text-[#0a322f]"
                        : ""
                    }`}>
                      {option}
                    </span>
                    {showAnswer && index === currentQuestion.correctOption && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check className="w-[1.25em] h-[1.25em] text-[#0a322f] text-4xl" />
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
              <h3 className="text-[#D0FF00] text-[2em] sm:text-[3.5em] font-bold mb-8">Fun Fact</h3>
              <p className="text-[#D0FF00] text-[1.25em] sm:text-[2.5em] ">
                {currentQuestion.funFact}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

