/**
 * Grok Games is dark-first: a solid near-black base, no patterns, no noise.
 * Depth comes from hairlines and type, not texture — so this is deliberately
 * just ink with a faint vertical protection gradient to seat the giant type.
 */
export default function QuizBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-ink">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(200_15%_11%),hsl(200_18%_8%)_45%,hsl(200_18%_7%))]" />
    </div>
  )
}
