/**
 * timezone helpers for the chore domain.
 *
 * every function is pure and takes an explicit `timezone`, so schedule math is
 * deterministic and testable without fake timers. phase 2 defaults everything
 * to 'UTC' (there is no picker yet), but the signatures are already zone-aware
 * so adding one later is a UI change plus a column default.
 */

export interface ZonedParts {
  /** full year, e.g. 2026 */
  y: number
  /** month 1-12 */
  m: number
  /** day of month 1-31 */
  d: number
  /** day of week, 0 = sunday */
  weekday: number
  /** minutes since local midnight */
  minutes: number
}

export interface ZonedTimeInput {
  y: number
  m: number
  d: number
  minutes: number
}

export const MINUTES_PER_DAY = 24 * 60
export const DAY_MS = 24 * 60 * 60 * 1000

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(timezone: string): Intl.DateTimeFormat | null {
  const cached = formatterCache.get(timezone)
  if (cached) return cached

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    formatterCache.set(timezone, formatter)
    return formatter
  } catch {
    // unknown/invalid zone — callers degrade to UTC math
    return null
  }
}

interface WallClock {
  y: number
  m: number
  d: number
  hour: number
  minute: number
  second: number
}

function wallClockInZone(ms: number, timezone: string): WallClock {
  const formatter = getFormatter(timezone)
  const date = new Date(ms)

  if (!formatter) {
    return {
      y: date.getUTCFullYear(),
      m: date.getUTCMonth() + 1,
      d: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
    }
  }

  const parts = formatter.formatToParts(date)
  const read = (type: Intl.DateTimeFormatPartTypes) => {
    const found = parts.find((part) => part.type === type)
    return found ? Number.parseInt(found.value, 10) : 0
  }

  // Intl renders midnight as hour 24 in some engines
  const hour = read('hour') % 24

  return {
    y: read('year'),
    m: read('month'),
    d: read('day'),
    hour,
    minute: read('minute'),
    second: read('second'),
  }
}

/** offset in ms to add to a UTC instant to get its wall-clock reading in `timezone` */
function zoneOffsetMs(ms: number, timezone: string): number {
  const wall = wallClockInZone(ms, timezone)
  const asUtc = Date.UTC(wall.y, wall.m - 1, wall.d, wall.hour, wall.minute, wall.second)
  // strip sub-second noise so repeated conversions stay stable
  return asUtc - Math.floor(ms / 1000) * 1000
}

/** split a UTC instant into its local calendar parts in `timezone` */
export function utcMsToZonedParts(ms: number, timezone: string): ZonedParts {
  const wall = wallClockInZone(ms, timezone)
  const weekday = new Date(Date.UTC(wall.y, wall.m - 1, wall.d)).getUTCDay()

  return {
    y: wall.y,
    m: wall.m,
    d: wall.d,
    weekday,
    minutes: wall.hour * 60 + wall.minute,
  }
}

/** turn local calendar parts in `timezone` back into a UTC instant */
export function zonedTimeToUtcMs(parts: ZonedTimeInput, timezone: string): number {
  const naive = Date.UTC(
    parts.y,
    parts.m - 1,
    parts.d,
    Math.floor(parts.minutes / 60),
    parts.minutes % 60
  )

  // one correction pass is enough for every real-world offset transition
  let guess = naive - zoneOffsetMs(naive, timezone)
  guess = naive - zoneOffsetMs(guess, timezone)
  return guess
}

/** 'YYYY-MM-DD' for the local calendar day of `ms` in `timezone` */
export function localDateKey(ms: number, timezone: string): string {
  const parts = utcMsToZonedParts(ms, timezone)
  const month = String(parts.m).padStart(2, '0')
  const day = String(parts.d).padStart(2, '0')
  return `${parts.y}-${month}-${day}`
}

/**
 * `days` local days after `ms`, landing at `minutes` past local midnight.
 * calendar arithmetic (not `+ n * 86400000`) so DST shifts do not drift the time.
 */
export function addLocalDaysAtTime(
  ms: number,
  days: number,
  minutes: number,
  timezone: string
): number {
  const parts = utcMsToZonedParts(ms, timezone)
  const shifted = new Date(Date.UTC(parts.y, parts.m - 1, parts.d + days))

  return zonedTimeToUtcMs(
    {
      y: shifted.getUTCFullYear(),
      m: shifted.getUTCMonth() + 1,
      d: shifted.getUTCDate(),
      minutes,
    },
    timezone
  )
}

/** the instant on the same local day as `ms` at `minutes` past local midnight */
export function snapToLocalTime(ms: number, minutes: number, timezone: string): number {
  return addLocalDaysAtTime(ms, 0, minutes, timezone)
}
