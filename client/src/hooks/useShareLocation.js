import { useCallback, useEffect, useRef, useState } from 'react'
import { sendLocation, clearLocation } from '../api/live-location.api'

const SEND_MS = 5000
const GRACE_MS = 20000 // time allowed for the first fix before we report a waiting state

const IS_MOBILE =
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)

// Phones have GPS, so use high accuracy there. Desktops use Wi-Fi or network lookup,
// which is faster and doesn't stall waiting for GPS hardware that isn't there.
const GEO_OPTIONS = {
  enableHighAccuracy: IS_MOBILE,
  maximumAge: 30000,
  timeout: 20000,
}

const INITIAL = { status: 'idle', sendError: null, lastFixAt: null }

// status: 'idle' | 'pending' | 'ok' | 'waiting' | 'blocked' | 'unavailable' | 'unsupported'
// sendError: set when the server rejects a position
// retry(): restarts the location request without reloading the page
export function useShareLocation(enabled) {
  const latest = useRef(null)
  const [state, setState] = useState(INITIAL)
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    if (!enabled) {
      setState(INITIAL)
      return
    }

    if (!navigator.geolocation) {
      setState({ ...INITIAL, status: 'unsupported' })
      return
    }

    let cancelled = false
    let gotFix = false
    let lastFixAt = null
    let watchId = null

    const patch = (p) => {
      if (!cancelled) setState((s) => ({ ...s, ...p }))
    }

    setState({ ...INITIAL, status: 'pending' })

    const sendNow = () => {
      if (!latest.current) return
      sendLocation(latest.current)
        .then(() => patch({ sendError: null }))
        .catch((err) => {
          const code = err.response?.status
          patch({
            sendError:
              code === 403
                ? 'Your role is not allowed to share location. Ask an administrator.'
                : `The server did not accept your location${code ? ` (error ${code})` : ''}.`,
          })
        })
    }

    const onFix = ({ coords }) => {
      gotFix = true
      lastFixAt = Date.now()
      latest.current = { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }
      patch({ status: 'ok', lastFixAt })
      sendNow()
    }

    const onError = (err) => {
      if (cancelled) return
      if (err.code === 1) return patch({ status: 'blocked' })
      // Once a fix exists, later errors don't change the status
      if (gotFix) return
      if (err.code === 2) return patch({ status: 'unavailable' })
      patch({ status: 'waiting' }) // timeout: keep waiting
    }

    watchId = navigator.geolocation.watchPosition(onFix, onError, GEO_OPTIONS)

    // If the browser reports nothing at all within the grace period, show waiting
    const graceTimer = setTimeout(() => {
      if (!gotFix) patch({ status: 'waiting' })
    }, GRACE_MS)

    const sendTimer = setInterval(sendNow, SEND_MS)

    return () => {
      cancelled = true
      clearTimeout(graceTimer)
      clearInterval(sendTimer)
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
      latest.current = null
      clearLocation().catch(() => {})
    }
  }, [enabled, attempt])

  return { ...state, retry }
}
