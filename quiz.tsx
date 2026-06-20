"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Timer from "./timer"
import QuizBackground from "./components/quiz-background"
import type { Question } from "./types"
import { Check, Lightbulb, Sparkles, Dices } from "lucide-react"

const questions: { questions: Question[] } = require("./questions.json")

const LETTERS = ["A", "B", "C", "D", "E"]
const LIME = "#D0FF00"

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions.questions[0])
  const [showAnswer, setShowAnswer] = useState(false)
  const [showFunFact, setShowFunFact] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * questions.questions.length)
    setCurrentQuestion(questions.questions[randomIndex])
  }, [])

  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false)
    setShowAnswer(true)
    setIsBlinking(true)

    // Stop the celebratory pulse, then surface the fun fact.
    setTimeout(() => {
      setIsBlinking(false)
      setShowFunFact(true)
    }, 5000)
  }, [])

  useEffect(() => {
    if (showFunFact) {
      const timer = setTimeout(() => {
        setShowFunFact(false)
        setShowAnswer(false)
        setIsTimerRunning(true)
        setIsBlinking(false)

        let randomIndex
        do {
          randomIndex = Math.floor(Math.random() * questions.questions.length)
        } while (questions.questions[randomIndex].question === currentQuestion.question)

        setCurrentQuestion(questions.questions[randomIndex])
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [showFunFact, currentQuestion])

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#05201d] font-['Poppins'] text-white antialiased">
      <QuizBackground />

      {/* ---- Top brand bar ------------------------------------------------ */}
      <header className="relative z-10 flex items-center justify-between px-[clamp(1.5rem,4vw,4rem)] pt-[clamp(1.25rem,3vh,2.5rem)]">
        <div className="flex items-center gap-3">
          <span className="flex h-[clamp(2.5rem,3.5vw,3.5rem)] w-[clamp(2.5rem,3.5vw,3.5rem)] items-center justify-center rounded-2xl bg-[#D0FF00] text-[#05201d] shadow-[0_0_30px_rgba(208,255,0,0.4)]">
            <Dices className="h-[60%] w-[60%]" strokeWidth={2.5} />
          </span>
          <div className="leading-none">
            <p className="text-[clamp(0.95rem,1.5vw,1.4rem)] font-black uppercase tracking-tight text-white">
              Diversão <span className="text-[#D0FF00]">Offline</span>
            </p>
            <p className="text-[clamp(0.6rem,0.9vw,0.8rem)] font-semibold uppercase tracking-[0.3em] text-white/40">
              Quiz Board Games
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#D0FF00]/30 bg-[#D0FF00]/5 px-[clamp(0.9rem,1.5vw,1.4rem)] py-2 backdrop-blur-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#D0FF00] shadow-[0_0_10px_#D0FF00]" />
          <span className="text-[clamp(0.7rem,1vw,0.95rem)] font-bold uppercase tracking-[0.2em] text-[#D0FF00]">
            Ao vivo
          </span>
        </div>
      </header>

      {/* ---- Main stage --------------------------------------------------- */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-[clamp(1.5rem,4vw,4rem)] py-[clamp(1rem,3vh,2.5rem)]">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            {!showFunFact ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                {/* Category + timer row */}
                <div className="mb-[clamp(1.5rem,4vh,3rem)] flex w-full flex-col items-center gap-[clamp(1rem,2.5vh,2rem)]">
                  <Timer duration={15} onComplete={handleTimerComplete} isRunning={isTimerRunning} />
                  <motion.span
                    key={currentQuestion.category}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-full bg-[#D0FF00] px-[clamp(1rem,2vw,1.75rem)] py-[clamp(0.35rem,0.8vh,0.6rem)] text-[clamp(0.8rem,1.3vw,1.15rem)] font-black uppercase tracking-[0.2em] text-[#05201d] shadow-[0_8px_30px_rgba(208,255,0,0.35)]"
                  >
                    {currentQuestion.category}
                  </motion.span>
                </div>

                {/* Question */}
                <h2 className="mb-[clamp(2rem,5vh,3.5rem)] text-center text-[clamp(1.75rem,4.2vw,4.25rem)] font-black leading-[1.05] tracking-tight text-white text-balance">
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="w-full space-y-[clamp(0.75rem,1.8vh,1.25rem)]">
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = index === currentQuestion.correctOption
                    const revealedCorrect = showAnswer && isCorrect
                    const revealedWrong = showAnswer && !isCorrect

                    return (
                      <motion.div
                        key={option}
                        initial={{ opacity: 0, x: -40 }}
                        animate={{
                          opacity: revealedWrong ? 0.3 : 1,
                          x: 0,
                          scale: revealedCorrect ? 1.03 : 1,
                        }}
                        transition={{ delay: showAnswer ? 0 : 0.15 + index * 0.12, duration: 0.4 }}
                        className={`group flex w-full items-center gap-[clamp(1rem,2vw,1.75rem)] rounded-3xl border-2 p-[clamp(0.9rem,1.8vh,1.5rem)] transition-colors duration-300
                          ${
                            revealedCorrect
                              ? "border-[#D0FF00] bg-[#D0FF00]"
                              : "border-white/10 bg-white/[0.04] backdrop-blur-sm"
                          }
                          ${revealedCorrect && isBlinking ? "blink-animation" : ""}`}
                        style={
                          revealedCorrect
                            ? { boxShadow: "0 0 50px rgba(208,255,0,0.45)" }
                            : undefined
                        }
                      >
                        {/* Letter badge */}
                        <span
                          className={`flex h-[clamp(2.75rem,4vw,4rem)] w-[clamp(2.75rem,4vw,4rem)] shrink-0 items-center justify-center rounded-2xl text-[clamp(1.25rem,2.2vw,2rem)] font-black transition-colors duration-300
                            ${
                              revealedCorrect
                                ? "bg-[#05201d] text-[#D0FF00]"
                                : "bg-[#D0FF00]/10 text-[#D0FF00]"
                            }`}
                        >
                          {revealedCorrect ? (
                            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}>
                              <Check className="h-[clamp(1.5rem,2.4vw,2.25rem)] w-[clamp(1.5rem,2.4vw,2.25rem)]" strokeWidth={3.5} />
                            </motion.span>
                          ) : (
                            LETTERS[index]
                          )}
                        </span>

                        {/* Option text */}
                        <span
                          className={`text-left text-[clamp(1.25rem,2.5vw,2.5rem)] font-bold leading-tight transition-colors duration-300
                            ${revealedCorrect ? "text-[#05201d]" : "text-white"}`}
                        >
                          {option}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              /* ---- Fun fact ------------------------------------------------ */
              <motion.div
                key="funfact"
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mx-auto max-w-5xl overflow-hidden rounded-[clamp(1.5rem,3vw,2.5rem)] border-2 border-[#D0FF00]/30 bg-[#0a322f]/60 p-[clamp(2rem,5vw,4.5rem)] text-center backdrop-blur-md"
              >
                {/* Glow accents */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#D0FF00]/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#36e0c4]/20 blur-3xl" />

                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-[clamp(1rem,2.5vh,2rem)] flex h-[clamp(4rem,7vw,6rem)] w-[clamp(4rem,7vw,6rem)] items-center justify-center rounded-3xl bg-[#D0FF00] text-[#05201d] shadow-[0_0_40px_rgba(208,255,0,0.5)]"
                >
                  <Lightbulb className="h-1/2 w-1/2" strokeWidth={2.5} />
                </motion.div>

                <div className="mb-[clamp(1rem,2.5vh,2rem)] flex items-center justify-center gap-3">
                  <Sparkles className="h-[clamp(1.25rem,2vw,2rem)] w-[clamp(1.25rem,2vw,2rem)] text-[#D0FF00]" />
                  <h3 className="text-[clamp(1.75rem,3.5vw,3.5rem)] font-black uppercase tracking-tight text-[#D0FF00]">
                    Você sabia?
                  </h3>
                  <Sparkles className="h-[clamp(1.25rem,2vw,2rem)] w-[clamp(1.25rem,2vw,2rem)] text-[#D0FF00]" />
                </div>

                <p className="mx-auto max-w-4xl text-[clamp(1.25rem,2.6vw,2.5rem)] font-medium leading-snug text-white text-balance">
                  {currentQuestion.funFact}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ---- Footer ------------------------------------------------------- */}
      <footer className="relative z-10 px-[clamp(1.5rem,4vw,4rem)] pb-[clamp(1rem,2.5vh,2rem)] text-center">
        <p className="text-[clamp(0.65rem,1vw,0.9rem)] font-semibold uppercase tracking-[0.3em] text-white/25">
          Teste seus conhecimentos · Diversão Offline
        </p>
      </footer>

      <style jsx global>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.55;
          }
        }
        .blink-animation {
          animation: blink 0.5s ease-in-out 3;
        }
      `}</style>
    </div>
  )
}
