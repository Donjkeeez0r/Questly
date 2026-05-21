import { useEffect, useMemo, useState } from 'react'

interface TypewriterTextProps {
  text: string
  speed?: number
}

export function TypewriterText({ text, speed = 16 }: TypewriterTextProps) {
  const [visibleLength, setVisibleLength] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleLength((prev) => {
        if (prev >= text.length) {
          window.clearInterval(timer)
          return prev
        }

        return prev + 1
      })
    }, speed)

    return () => window.clearInterval(timer)
  }, [text.length, speed])

  const visibleText = useMemo(() => text.slice(0, visibleLength), [text, visibleLength])

  return (
    <p className="whitespace-pre-wrap leading-relaxed text-slate-200">
      {visibleText}
      {visibleLength < text.length ? <span className="animate-pulse text-fuchsia-300">|</span> : null}
    </p>
  )
}
