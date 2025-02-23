import Quiz from "./quiz"
import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export default function Page() {
  return (
    <main className={poppins.className}>
      <Quiz />
    </main>
  )
}

