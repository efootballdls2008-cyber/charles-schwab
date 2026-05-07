import { useEffect, useState } from 'react'

/**
 * Displays a live updating time string (HH:MM:SS).
 * Renders nothing on the server — safe for SSR.
 */
export default function LiveClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return <span className="text-xs text-gray-400 tabular-nums">{time}</span>
}
