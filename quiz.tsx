"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Timer from "./timer"
import QuizBackground from "./components/quiz-background"
import type { Question } from "./types"

const questions: { questions: Question[] } = require("./questions.json")

const LETTERS = ["A", "B", "C", "D", "E"]

// Grok Games brand accents, assigned to answer slots: teal (primary), amber, lime.
const COMPONENT = [
  { key: "teal", solid: "#29C6B0", soft: "rgba(41,198,176,0.14)", line: "rgba(41,198,176,0.45)" },
  { key: "amber", solid: "#F6B23D", soft: "rgba(246,178,61,0.15)", line: "rgba(246,178,61,0.45)" },
  { key: "lime", solid: "#C9DB2E", soft: "rgba(201,219,46,0.14)", line: "rgba(201,219,46,0.45)" },
  { key: "teal2", solid: "#3DBDAD", soft: "rgba(61,189,173,0.14)", line: "rgba(61,189,173,0.45)" },
]

const INK = "#10181B" // near-black brand background / text on bright tiles
const SURFACE = "#16242B" // raised charcoal surface for resting tiles

function Meeple({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill={color} aria-hidden>
      <path d="M32 4c-5 0-8 3.5-8 8 0 2.4 1 4.4 2.6 5.8-3.4 1.2-7.6 2.6-12 4-3.4 1.1-5.6 2.6-5.6 5.2 0 2.4 2 4 4.6 4 2.2 0 5-.7 8-1.6-2.2 6-4.4 12.4-5.4 16.2C15 56 16.8 60 21 60c2.8 0 4.6-1.7 6-4.4L32 46l5 9.6c1.4 2.7 3.2 4.4 6 4.4 4.2 0 6-4 4.4-8.4-1-3.8-3.2-10.2-5.4-16.2 3 .9 5.8 1.6 8 1.6 2.6 0 4.6-1.6 4.6-4 0-2.6-2.2-4.1-5.6-5.2-4.4-1.4-8.6-2.8-12-4C39 16.4 40 14.4 40 12c0-4.5-3-8-8-8z" />
    </svg>
  )
}

// Grok Games mark: three layered offset squares + "grok." wordmark, amber dot.
function GrokLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 149.38 101.67" className={className} aria-label="Grok Games">
      <rect x="9.88" y="10.45" fill="#C9DB2E" width="107.62" height="58.76" />
      <rect x="31.88" y="32.45" fill="#3DBDAD" width="107.62" height="58.76" />
      <rect x="20.88" y="21.45" fill="#16242B" width="107.62" height="58.76" />
      <path fill="#F3F5F6" d="M47.1,44.33l0.21-2.08h3.81v17.2c0,2.79-0.85,5.02-2.54,6.64c-1.7,1.62-3.96,2.44-6.82,2.44c-3.46,0-6.29-1.27-8.44-3.78l2.79-2.79c1.59,1.87,3.46,2.83,5.62,2.83c3.14,0,5.16-2.08,5.16-5.23v-1.48c-1.2,1.45-2.97,2.16-5.26,2.16c-2.37,0-4.31-0.85-5.83-2.58c-1.52-1.73-2.26-3.96-2.26-6.6c0-2.65,0.74-4.84,2.26-6.57c1.52-1.73,3.46-2.58,5.83-2.58C44.14,41.9,45.94,42.71,47.1,44.33z M37.81,51.04c0,3.25,1.94,5.44,4.73,5.44c1.84,0,3.29-0.88,4.34-2.65v-5.55c-1.06-1.77-2.51-2.65-4.34-2.65C39.75,45.64,37.81,47.79,37.81,51.04z" />
      <path fill="#F3F5F6" d="M65.58,46.13h-0.35c-1.8,0-3.36,0.88-4.66,2.68v11.23h-4.24v-17.8h3.81l0.21,2.37c0.99-1.55,2.83-2.72,5.23-2.72V46.13z" />
      <path fill="#F3F5F6" d="M82.93,57.79c-1.73,1.73-3.96,2.61-6.61,2.61s-4.88-0.88-6.64-2.61c-1.73-1.73-2.61-3.96-2.61-6.6c0-2.68,0.88-4.91,2.61-6.64c1.77-1.77,3.99-2.65,6.64-2.65s4.88,0.88,6.61,2.65c1.77,1.73,2.65,3.96,2.65,6.64C85.58,53.83,84.69,56.06,82.93,57.79z M76.32,56.66c1.45,0,2.61-0.53,3.57-1.55c0.95-1.02,1.41-2.33,1.41-3.92c0-1.59-0.46-2.93-1.41-3.96c-0.95-1.06-2.12-1.59-3.57-1.59s-2.61,0.53-3.57,1.59c-0.92,1.02-1.38,2.37-1.38,3.96C71.38,54.33,73.46,56.66,76.32,56.66z" />
      <path fill="#F3F5F6" d="M93.42,33.21v19.43l6.89-10.39h5.09l-5.44,7.59l6.15,10.21h-4.88l-4.03-6.61l-4.66,6.61h-3.36V33.21H93.42z" />
      <path fill="#F2A71B" d="M116.21,54.35c1.4,1.31,1.4,3.84,0,5.16c-1.31,1.31-3.71,1.31-5.11,0c-1.31-1.31-1.31-3.84,0-5.16C112.5,53.04,114.9,53.04,116.21,54.35z" />
    </svg>
  )
}

// Short, celebratory burst of player-color cubes from the winning tile.
const CONFETTI = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2
  const dist = 90 + (i % 4) * 34
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist - 30,
    rot: (i % 2 ? 1 : -1) * (120 + i * 18),
    color: COMPONENT[i % 4].solid,
    delay: (i % 5) * 0.03,
  }
})

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      {CONFETTI.map((p, i) => (
        <motion.span
          key={i}
          className="absolute h-3 w-3 rounded-[3px]"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, scale: [0, 1, 0.9], opacity: [1, 1, 0], rotate: p.rot }}
          transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
        />
      ))}
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
    // Let the reveal land, then bring up the fun fact.
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#10181B] font-body text-white antialiased">
      <QuizBackground />

      {/* ---- Round-track timer (floating, top-right) ---------------------- */}
      <div className="absolute right-[clamp(1.5rem,4vw,4.5rem)] top-[clamp(1.5rem,4vh,3rem)] z-20">
        <Timer duration={15} onComplete={handleTimerComplete} isRunning={isTimerRunning} />
      </div>

      {/* ---- Main stage --------------------------------------------------- */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-[clamp(1.5rem,4vw,4.5rem)] py-[clamp(2rem,5vh,3.5rem)]">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            {!showFunFact ? (
              <motion.div
                key="question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                {/* Category — a labeled component tile */}
                <motion.div
                  key={currentQuestion.category}
                  initial={reduce ? false : { y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mb-[clamp(1.25rem,3vh,2.25rem)] inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-[clamp(0.9rem,1.6vw,1.4rem)] py-[clamp(0.5rem,1vh,0.75rem)] backdrop-blur-sm"
                >
                  <span className="h-2.5 w-2.5 rounded-[3px] bg-[#C9DB2E]" />
                  <span className="font-mono text-[clamp(0.75rem,1.3vw,1.05rem)] font-bold uppercase tracking-[0.22em] text-[#C9DB2E]">
                    {currentQuestion.category}
                  </span>
                </motion.div>

                {/* Question — the warm card on the table */}
                <motion.div
                  initial={reduce ? false : { y: 18, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="relative mb-[clamp(1.75rem,4.5vh,3rem)] w-full rounded-[clamp(1.25rem,2.5vw,2rem)] bg-[#F6EEDD] px-[clamp(1.5rem,4vw,4rem)] py-[clamp(1.5rem,4vh,3rem)] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]"
                >
                  {/* card corner notch */}
                  <span className="absolute right-[clamp(1.25rem,3vw,2.5rem)] top-[clamp(1.25rem,3vh,2rem)] font-mono text-[clamp(0.65rem,1vw,0.85rem)] font-bold uppercase tracking-[0.25em] text-[#15132A]/35">
                    pergunta
                  </span>
                  <h2
                    className="text-center font-display text-[clamp(1.6rem,3.6vw,3.6rem)] font-extrabold leading-[1.08] tracking-tight text-balance"
                    style={{ color: INK }}
                  >
                    {currentQuestion.question}
                  </h2>
                </motion.div>

                {/* Options — board-game component tiles */}
                <div className="w-full space-y-[clamp(0.7rem,1.6vh,1.1rem)]">
                  {currentQuestion.options.map((option, index) => {
                    const c = COMPONENT[index % COMPONENT.length]
                    const isCorrect = index === currentQuestion.correctOption
                    const won = showAnswer && isCorrect
                    const lost = showAnswer && !isCorrect

                    return (
                      <motion.div
                        key={option}
                        initial={reduce ? false : { opacity: 0, y: 26, rotate: index % 2 ? 1.5 : -1.5 }}
                        animate={{
                          opacity: lost ? 0.32 : 1,
                          y: 0,
                          rotate: 0,
                          scale: won ? 1.035 : 1,
                          filter: lost ? "grayscale(0.7)" : "grayscale(0)",
                        }}
                        transition={{
                          delay: showAnswer || reduce ? 0 : 0.25 + index * 0.12,
                          duration: 0.42,
                          ease: "easeOut",
                        }}
                        className="relative flex w-full items-center gap-[clamp(0.9rem,1.8vw,1.6rem)] rounded-[clamp(1rem,1.8vw,1.5rem)] border-2 p-[clamp(0.7rem,1.4vh,1.1rem)]"
                        style={{
                          backgroundColor: won ? c.solid : SURFACE,
                          borderColor: won ? c.solid : c.line,
                          boxShadow: won ? `0 18px 50px -12px ${c.solid}aa` : "none",
                        }}
                      >
                        {won && !reduce && <Confetti />}

                        {/* Component token: letter, becomes a standing meeple on win */}
                        <span
                          className="relative flex h-[clamp(2.9rem,4.4vw,4.25rem)] w-[clamp(2.9rem,4.4vw,4.25rem)] shrink-0 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: won ? INK : c.soft }}
                        >
                          <AnimatePresence mode="wait">
                            {won ? (
                              <motion.span
                                key="meeple"
                                initial={{ scale: 0, y: 6 }}
                                animate={{ scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 240, damping: 14 }}
                                className="flex h-full w-full items-center justify-center"
                              >
                                <Meeple className="h-[62%] w-[62%]" color={c.solid} />
                              </motion.span>
                            ) : (
                              <motion.span
                                key="letter"
                                className="font-display text-[clamp(1.35rem,2.3vw,2.1rem)] font-extrabold"
                                style={{ color: c.solid }}
                              >
                                {LETTERS[index]}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>

                        {/* Option label */}
                        <span
                          className="flex-1 text-left font-body text-[clamp(1.2rem,2.4vw,2.4rem)] font-bold leading-tight"
                          style={{ color: won ? INK : "#FFFFFF" }}
                        >
                          {option}
                        </span>

                        {/* Win tag */}
                        {won && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            className="mr-1 hidden shrink-0 rounded-full px-4 py-1.5 font-mono text-[clamp(0.7rem,1.1vw,0.95rem)] font-bold uppercase tracking-[0.18em] sm:block"
                            style={{ backgroundColor: INK, color: c.solid }}
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
              /* ---- Fun fact card ------------------------------------------ */
              <motion.div
                key="funfact"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[clamp(1.25rem,2.5vw,2rem)] bg-[#F6EEDD] shadow-[0_28px_70px_-20px_rgba(0,0,0,0.75)]"
              >
                {/* amber header strip */}
                <div className="flex items-center gap-3 bg-[#F6B23D] px-[clamp(1.5rem,4vw,3.5rem)] py-[clamp(0.9rem,2vh,1.4rem)]">
                  <Meeple className="h-[clamp(1.5rem,2.4vw,2.25rem)] w-[clamp(1.5rem,2.4vw,2.25rem)]" color={INK} />
                  <h3
                    className="font-display text-[clamp(1.4rem,3vw,2.75rem)] font-extrabold uppercase tracking-tight"
                    style={{ color: INK }}
                  >
                    Você sabia?
                  </h3>
                </div>

                <p
                  className="px-[clamp(1.5rem,4vw,3.5rem)] py-[clamp(1.75rem,4.5vh,3.25rem)] text-center font-body text-[clamp(1.2rem,2.5vw,2.4rem)] font-medium leading-snug text-balance"
                  style={{ color: INK }}
                >
                  {currentQuestion.funFact}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Discreet brand mark, bottom-left */}
      <div className="pointer-events-none absolute bottom-[clamp(1.5rem,4vh,3rem)] left-[clamp(1.5rem,4vw,4rem)] z-20">
        <GrokLogo className="h-[clamp(1.75rem,2.6vw,2.6rem)] w-auto opacity-80" />
      </div>
    </div>
  )
}
