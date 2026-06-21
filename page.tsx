import Quiz from "./quiz"
import { Bebas_Neue, DM_Sans } from "next/font/google"

// Grok Games uses two families only: Bebas Neue for all headings/UI chrome
// (always uppercase) and DM Sans for body copy.
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm",
})

export default function Page() {
  return (
    <main className={`${bebas.variable} ${dmSans.variable}`}>
      <Quiz />
    </main>
  )
}
