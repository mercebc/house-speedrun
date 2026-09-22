import { useEffect, useState } from 'react'

export function useElapsedSeconds(active: boolean, startedAt: Date | null): number {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!active || startedAt === null) return

    function tick() {
      setElapsedSeconds(Math.round((Date.now() - startedAt!.getTime()) / 1000))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [active, startedAt])

  return elapsedSeconds
}
