import { useEffect, useState } from 'react'

/**
 * a clock that re-renders on an interval.
 *
 * due buckets are derived from `nextDueAt` vs. now, so without a tick a chore
 * would sit in "upcoming" until something else happened to re-render the board.
 * one minute is fine: the smallest bucket boundary is an hour wide.
 */
export function useNowTick(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
