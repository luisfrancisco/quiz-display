import Quiz from "./quiz"
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Space_Mono } from "next/font/google"

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
})

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-body",
})

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

export default function Page() {
  return (
    <main className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <Quiz />
    </main>
  )
}
