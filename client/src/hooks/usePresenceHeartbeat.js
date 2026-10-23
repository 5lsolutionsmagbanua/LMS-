import { useEffect } from 'react'
import { sendHeartbeat } from '../api/liveLocation.api'

const HEARTBEAT_MS = 30000

// Tells the server this user is signed in and the app is open.
// Runs for every role, because it needs no permission and no GPS.
export function usePresenceHeartbeat(enabled) {
  useEffect(() => {
    if (!enabled) return

    const beat = () =>
      sendHeartbeat().catch((err) =>
        console.warn('[presence] heartbeat failed:', err.response?.status),
      )

    beat()
    const timer = setInterval(beat, HEARTBEAT_MS)
    return () => clearInterval(timer)
  }, [enabled])
}
