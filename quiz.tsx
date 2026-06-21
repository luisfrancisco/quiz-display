"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Timer from "./timer"
import QuizBackground from "./components/quiz-background"
import type { Question } from "./types"
import { Check, Sparkles } from "lucide-react"

const questions: { questions: Question[] } = require("./questions.json")

const LETTERS = ["A", "B", "C", "D", "E"]
// Grok's hero easing — the custom ease-out used for big text rise.
const RISE = [0.25, 0.1, 0, 1] as const

// Grok Games mark: three layered offset squares + "grok." wordmark, amber dot.
function GrokLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 149.38 101.67" className={className} aria-label="Grok Games">
      <rect x="9.88" y="10.45" fill="#C9DB2E" width="107.62" height="58.76" />
      <rect x="31.88" y="32.45" fill="#3DBDAD" width="107.62" height="58.76" />
      <rect x="20.88" y="21.45" fill="#16242B" width="107.62" height="58.76" />
      <path
        fill="#F3F5F6"
        d="M47.1,44.33l0.21-2.08h3.81v17.2c0,2.79-0.85,5.02-2.54,6.64c-1.7,1.62-3.96,2.44-6.82,2.44c-3.46,0-6.29-1.27-8.44-3.78l2.79-2.79c1.59,1.87,3.46,2.83,5.62,2.83c3.14,0,5.16-2.08,5.16-5.23v-1.48c-1.2,1.45-2.97,2.16-5.26,2.16c-2.37,0-4.31-0.85-5.83-2.58c-1.52-1.73-2.26-3.96-2.26-6.6c0-2.65,0.74-4.84,2.26-6.57c1.52-1.73,3.46-2.58,5.83-2.58C44.14,41.9,45.94,42.71,47.1,44.33z M37.81,51.04c0,3.25,1.94,5.44,4.73,5.44c1.84,0,3.29-0.88,4.34-2.65v-5.55c-1.06-1.77-2.51-2.65-4.34-2.65C39.75,45.64,37.81,47.79,37.81,51.04z"
      />
      <path
        fill="#F3F5F6"
        d="M65.58,46.13h-0.35c-1.8,0-3.36,0.88-4.66,2.68v11.23h-4.24v-17.8h3.81l0.21,2.37c0.99-1.55,2.83-2.72,5.23-2.72V46.13z"
      />
      <path
        fill="#F3F5F6"
        d="M82.93,57.79c-1.73,1.73-3.96,2.61-6.61,2.61s-4.88-0.88-6.64-2.61c-1.73-1.73-2.61-3.96-2.61-6.6c0-2.68,0.88-4.91,2.61-6.64c1.77-1.77,3.99-2.65,6.64-2.65s4.88,0.88,6.61,2.65c1.77,1.73,2.65,3.96,2.65,6.64C85.58,53.83,84.69,56.06,82.93,57.79z M76.32,56.66c1.45,0,2.61-0.53,3.57-1.55c0.95-1.02,1.41-2.33,1.41-3.92c0-1.59-0.46-2.93-1.41-3.96c-0.95-1.06-2.12-1.59-3.57-1.59s-2.61,0.53-3.57,1.59c-0.92,1.02-1.38,2.37-1.38,3.96C71.38,54.33,73.46,56.66,76.32,56.66z"
      />
      <path
        fill="#F3F5F6"
        d="M93.42,33.21v19.43l6.89-10.39h5.09l-5.44,7.59l6.15,10.21h-4.88l-4.03-6.61l-4.66,6.61h-3.36V33.21H93.42z"
      />
      <path fill="#F2A71B" d="M116.21,54.35c1.4,1.31,1.4,3.84,0,5.16c-1.31,1.31-3.71,1.31-5.11,0c-1.31-1.31-1.31-3.84,0-5.16C112.5,53.04,114.9,53.04,116.21,54.35z" />
    </svg>
  )
}

const MARQUEE_WORDS = ["TODO MUNDO SE DIVERTE", "QUIZ DE BOARD GAMES", "DIVERSÃO OFFLINE", "GROK GAMES"]

function Marquee() {
  const seq = [...MARQUEE_WORDS, ...MARQUEE_WORDS]
  return (
    <div className="relative z-10 overflow-hidden border-t border-hairline py-[clamp(0.5rem,1.3vh,0.9rem)]">
      <div className="marquee-track flex w-max items-center whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center">
            {seq.map((word, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span className="font-heading text-[clamp(0.85rem,1.4vw,1.2rem)] uppercase tracking-[0.2em] text-fg/25">
                  {word}
                </span>
                <span className="mx-[clamp(1rem,2.5vw,2.5rem)] text-lime">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(questions.questions[0])
  const [showAnswer, setShowAnswer] = useState(false)
  const [showFunFact, setShowFunFact] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const reduce = useReducedMotion()

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * questions.questions.length)
    setCurrentQuestion(questions.questions[randomIndex])
  }, [])

  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false)
    setShowAnswer(true)
    setTimeout(() => setShowFunFact(true), 5000)
  }, [])

  useEffect(() => {
    if (showFunFact) {
      const timer = setTimeout(() => {
        setShowFunFact(false)
        setShowAnswer(false)
        setIsTimerRunning(true)

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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ink font-body text-fg antialiased">
      <QuizBackground />

      {/* Countdown — floating, top-right */}
      <div className="absolute right-[clamp(1.5rem,4vw,4rem)] top-[clamp(1.5rem,4vh,3rem)] z-20">
        <Timer duration={15} onComplete={handleTimerComplete} isRunning={isTimerRunning} />
      </div>

      {/* ---- Main stage --------------------------------------------------- */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-[clamp(1.5rem,5vw,6rem)] py-[clamp(2.5rem,6vh,4rem)]">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            {!showFunFact ? (
              <motion.div
                key="question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col items-center"
              >
                {/* Category eyebrow — lime, tiny, wide tracking */}
                <motion.div
                  key={currentQuestion.category}
                  initial={reduce ? false : { y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-[clamp(1.25rem,3.5vh,2.5rem)] flex items-center gap-3"
                >
                  <span className="text-lime">✦</span>
                  <span className="font-heading text-[clamp(0.85rem,1.5vw,1.25rem)] uppercase tracking-[0.3em] text-lime">
                    {currentQuestion.category}
                  </span>
                </motion.div>

                {/* Question — giant Bebas billboard, no card */}
                <motion.h1
                  initial={reduce ? false : { y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, ease: RISE }}
                  className="mb-[clamp(2rem,5.5vh,4rem)] max-w-5xl text-center font-heading text-[clamp(2.25rem,5.5vw,6rem)] uppercase leading-[0.92] tracking-[0.01em] text-fg text-balance"
                >
                  {currentQuestion.question}
                </motion.h1>

                {/* Options — sharp, hairline-bordered editorial rows */}
                <div className="w-full max-w-4xl">
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = index === currentQuestion.correctOption
                    const won = showAnswer && isCorrect
                    const lost = showAnswer && !isCorrect

                    return (
                      <motion.div
                        key={option}
                        initial={reduce ? false : { opacity: 0, y: 30 }}
                        animate={{ opacity: lost ? 0.3 : 1, y: 0 }}
                        transition={{
                          delay: showAnswer || reduce ? 0 : 0.25 + index * 0.1,
                          duration: 0.6,
                          ease: RISE,
                        }}
                        className="group relative mb-[clamp(0.6rem,1.4vh,1rem)] flex w-full items-center gap-[clamp(1rem,2vw,1.75rem)] border p-[clamp(0.7rem,1.5vh,1.2rem)]"
                        style={{
                          backgroundColor: won ? "hsl(174 72% 46%)" : "transparent",
                          borderColor: won ? "hsl(174 72% 46%)" : "hsl(200 10% 18%)",
                        }}
                      >
                        {/* Letter / check token */}
                        <span
                          className="flex h-[clamp(2.75rem,4.5vw,4.25rem)] w-[clamp(2.75rem,4.5vw,4.25rem)] shrink-0 items-center justify-center"
                          style={{ backgroundColor: won ? "hsl(200 18% 8%)" : "hsl(200 15% 12%)" }}
                        >
                          {won ? (
                            <motion.span
                              initial={reduce ? false : { scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.35, ease: RISE }}
                            >
                              <Check
                                className="h-[clamp(1.5rem,2.4vw,2.25rem)] w-[clamp(1.5rem,2.4vw,2.25rem)] text-teal"
                                strokeWidth={2}
                              />
                            </motion.span>
                          ) : (
                            <span className="font-heading text-[clamp(1.4rem,2.4vw,2.25rem)] leading-none text-teal">
                              {LETTERS[index]}
                            </span>
                          )}
                        </span>

                        {/* Option label — uppercase Bebas */}
                        <span
                          className="flex-1 text-left font-heading text-[clamp(1.4rem,3vw,3rem)] uppercase leading-[0.95] tracking-[0.02em]"
                          style={{ color: won ? "hsl(200 18% 8%)" : "hsl(180 10% 92%)" }}
                        >
                          {option}
                        </span>

                        {/* Correct tag */}
                        {won && (
                          <motion.span
                            initial={reduce ? false : { opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mr-1 hidden shrink-0 font-heading text-[clamp(0.85rem,1.3vw,1.15rem)] uppercase tracking-[0.2em] text-ink sm:block"
                          >
                            certa
                          </motion.span>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              /* ---- Fun fact — editorial, hairline-framed ------------------ */
              <motion.div
                key="funfact"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: RISE }}
                className="mx-auto max-w-5xl border-y border-hairline py-[clamp(2.5rem,6vh,4.5rem)] text-center"
              >
                <div className="mb-[clamp(1.5rem,3.5vh,2.5rem)] flex items-center justify-center gap-3">
                  <Sparkles className="h-[clamp(1.1rem,1.8vw,1.6rem)] w-[clamp(1.1rem,1.8vw,1.6rem)] text-lime" strokeWidth={2} />
                  <span className="font-heading text-[clamp(1rem,2vw,1.6rem)] uppercase tracking-[0.3em] text-lime">
                    Você sabia?
                  </span>
                </div>
                <p className="mx-auto max-w-4xl text-[clamp(1.35rem,2.8vw,2.6rem)] font-medium leading-[1.4] text-fg text-balance">
                  {currentQuestion.funFact}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Brand marquee replaces the old footer */}
      <Marquee />

      {/* Discreet brand mark, bottom-left over the marquee gutter */}
      <div className="pointer-events-none absolute bottom-[clamp(0.6rem,1.5vh,1rem)] left-[clamp(1.5rem,4vw,4rem)] z-20">
        <GrokLogo className="h-[clamp(1.6rem,2.4vw,2.4rem)] w-auto opacity-80" />
      </div>
    </div>
  )
}
