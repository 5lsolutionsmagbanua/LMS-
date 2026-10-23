import { useCallback, useEffect, useRef, useState } from 'react'
import { sendLiveLocation, clearLiveLocation } from '../api/live-location.api'
import { getLiveLocationDeviceId } from '../utils/live-location-device-id'

const CHECK_MS = 5000 // how often the throttle is evaluated
const MIN_MOVE_M = 10 // send early if the device moved at least this far
const MAX_GAP_MS = 15000 // send at least this often, even when parked
const GRACE_MS = 20000

const IS_MOBILE =
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)

// Phones have GPS, so use high accuracy there. Desktops use Wi-Fi or network lookup.
const GEO_OPTIONS = { enableHighAccuracy: IS_MOBILE, maximumAge: 30000, timeout: 20000 }

const INITIAL = { status: 'idle', sendError: null, lastFixAt: null }

// Great-circle distance between two { lat, lng } points, in metres
const metresBetween = (a, b) => {
  const R = 6371000
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// status: 'idle' | 'pending' | 'ok' | 'waiting' | 'blocked' | 'unavailable' | 'unsupported'
export function useLiveLocationShare(enabled) {
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

    const deviceId = getLiveLocationDeviceId()
    let cancelled = false
    let gotFix = false
    let watchId = null
    let lastSent = null // last fix that was actually posted
    let lastSentAt = 0

    const patch = (p) => {
      if (!cancelled) setState((s) => ({ ...s, ...p }))
    }

    setState({ ...INITIAL, status: 'pending' })

    // Posts only when the device moved enough, or enough time passed since the last post
    const sendIfDue = () => {
      if (!latest.current) return

      const now = Date.now()
      const moved = lastSent ? metresBetween(lastSent, latest.current) : Infinity
      if (moved < MIN_MOVE_M && now - lastSentAt < MAX_GAP_MS) return

      const payload = latest.current
      lastSent = payload
      lastSentAt = now

      sendLiveLocation({ ...payload, deviceId })
        .then(() => patch({ sendError: null }))
        .catch((err) => {
          lastSent = null // retry on the next check
          const code = err.response?.status
          const serverMessage = err.response?.data?.message
          patch({
            sendError:
              code === 403
                ? 'Your role is not allowed to share location. Ask an administrator.'
                : code === 400
                  ? `The location was rejected: ${serverMessage ?? 'invalid data'}.`
                  : `The server did not accept your location${code ? ` (error ${code})` : ''}.`,
          })
        })
    }

    const onFix = (pos) => {
      const { coords } = pos
      gotFix = true
      latest.current = {
        lat: coords.latitude,
        lng: coords.longitude,
        accuracy: coords.accuracy,
        speed: coords.speed,
        heading: coords.heading,
        altitude: coords.altitude,
      }
      patch({ status: 'ok', lastFixAt: Date.now() })
      sendIfDue()
    }

    const onError = (err) => {
      if (cancelled) return
      if (err.code === 1) return patch({ status: 'blocked' })
      if (gotFix) return
      if (err.code === 2) return patch({ status: 'unavailable' })
      patch({ status: 'waiting' })
    }

    watchId = navigator.geolocation.watchPosition(onFix, onError, GEO_OPTIONS)

    const graceTimer = setTimeout(() => {
      if (!gotFix) patch({ status: 'waiting' })
    }, GRACE_MS)

    const checkTimer = setInterval(sendIfDue, CHECK_MS)

    return () => {
      cancelled = true
      clearTimeout(graceTimer)
      clearInterval(checkTimer)
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
      latest.current = null
      clearLiveLocation(deviceId).catch(() => {})
    }
  }, [enabled, attempt])

  return { ...state, retry }
}
