import { useCallback, useEffect, useReducer } from 'react'

const keyFor = (userId) => `lms.liveLocation.consent.${userId}`

// In-memory copy, used when localStorage is blocked (private mode, strict settings)
const memory = {}
const listeners = new Set()

const read = (userId) => {
  if (!userId) return 'unset'
  try {
    const stored = localStorage.getItem(keyFor(userId))
    if (stored) return stored
  } catch {
    /* storage blocked: fall back to memory */
  }
  return memory[userId] ?? 'unset'
}

const write = (userId, value) => {
  if (!userId) return
  memory[userId] = value
  try {
    localStorage.setItem(keyFor(userId), value)
  } catch {
    /* storage blocked: the memory copy still applies for this session */
  }
  listeners.forEach((notify) => notify())
}

// 'unset' (never asked), 'granted', or 'denied'
export function useLiveLocationConsent(userId) {
  const [, rerender] = useReducer((n) => n + 1, 0)

  useEffect(() => {
    listeners.add(rerender)
    return () => {
      listeners.delete(rerender)
    }
  }, [])

  const consent = read(userId)
  const setConsent = useCallback((value) => write(userId, value), [userId])

  return { consent, setConsent }
}
