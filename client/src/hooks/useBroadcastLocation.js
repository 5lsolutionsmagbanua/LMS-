import { useEffect, useRef, useState } from 'react'
import { sendLocation, clearLocation } from '../api/liveLocation.api'

const SEND_INTERVAL_MS = 5000

const GEO_MESSAGES = {
  1: 'Location permission denied.',
  2: 'Location unavailable.',
  3: 'Location request timed out.',
}

// Watches this user's GPS and sends the latest fix every 5 seconds.
// Returns an error message string, or null.
export function useBroadcastLocation(enabled) {
  const latest = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setError(null)

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        latest.current = {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
        }
        setError(null)
      },
      (err) => setError(GEO_MESSAGES[err.code] || 'Could not get your location.'),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    )

    const timer = setInterval(() => {
      if (latest.current) {
        sendLocation(latest.current).catch((err) =>
          console.error('Failed to send location:', err),
        )
      }
    }, SEND_INTERVAL_MS)

    return () => {
      navigator.geolocation.clearWatch(watchId)
      clearInterval(timer)
      latest.current = null
      clearLocation().catch(() => {})
    }
  }, [enabled])

  return error
}