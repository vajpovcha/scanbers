import { useState, useEffect, useRef } from 'react'

const COOLDOWN_MS    = 2 * 60 * 1000   // 2 minutes between submissions
const WINDOW_MS      = 60 * 60 * 1000  // 1 hour rolling window
const MAX_PER_WINDOW = 5               // max submissions per hour

function fmt(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * useRateLimit(storageKey)
 *
 * Returns:
 *   allowed       – boolean, can submit right now
 *   waitSeconds   – seconds until allowed again (0 when allowed)
 *   remaining     – submissions left in current hour
 *   isHourlyLimit – true if the 5/hr cap is hit (vs cooldown)
 *   waitFmt       – "M:SS" formatted wait string
 *   recordSubmission() – call this after a successful submission
 */
export function useRateLimit(storageKey) {
  const [state, setState] = useState({
    allowed: true,
    waitSeconds: 0,
    remaining: MAX_PER_WINDOW,
    isHourlyLimit: false,
    waitFmt: '0:00',
  })
  const intervalRef = useRef(null)

  function getTimestamps() {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  function saveTimestamps(ts) {
    try { localStorage.setItem(storageKey, JSON.stringify(ts)) } catch {}
  }

  function compute() {
    const now        = Date.now()
    const timestamps = getTimestamps().filter(t => now - t < WINDOW_MS)
    // Prune old ones
    saveTimestamps(timestamps)

    const last           = timestamps.length > 0 ? Math.max(...timestamps) : 0
    const cooldownLeft   = Math.max(0, COOLDOWN_MS - (now - last))
    const isHourlyLimit  = timestamps.length >= MAX_PER_WINDOW
    const remaining      = Math.max(0, MAX_PER_WINDOW - timestamps.length)

    let waitSeconds = 0
    if (isHourlyLimit) {
      // Wait until oldest timestamp falls out of the 1-hour window
      const oldest = Math.min(...timestamps)
      waitSeconds = Math.ceil((oldest + WINDOW_MS - now) / 1000)
    } else if (cooldownLeft > 0) {
      waitSeconds = Math.ceil(cooldownLeft / 1000)
    }

    const allowed = !isHourlyLimit && cooldownLeft === 0

    setState({ allowed, waitSeconds, remaining, isHourlyLimit, waitFmt: fmt(waitSeconds) })
  }

  function recordSubmission() {
    const now = Date.now()
    const timestamps = [...getTimestamps().filter(t => now - t < WINDOW_MS), now]
    saveTimestamps(timestamps)
    compute()
  }

  useEffect(() => {
    compute()
    intervalRef.current = setInterval(compute, 1000)
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ...state, recordSubmission }
}
