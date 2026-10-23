import { useEffect } from 'react'
import { sendHeartbeat } from '../api/live-location.api'

const HEARTBEAT_MS = 30000

// Tells the server this user is signed in and the app is open. Needs no permission and no GPS.
export function useLiveLocationHeartbeat(enabled) {
  useEffect(() => {
    if (!enabled) return

    const beat = () =>
      sendHeartbeat().catch((err) =>
        console.warn('[live-location] heartbeat failed:', err.response?.status),
      )

    beat()
    const timer = setInterval(beat, HEARTBEAT_MS)
    return () => clearInterval(timer)
  }, [enabled])
}
