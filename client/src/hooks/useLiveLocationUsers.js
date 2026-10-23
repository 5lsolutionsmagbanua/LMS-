import { useEffect, useRef, useState } from 'react'
import { getLiveUsers } from '../api/live-location.api'

const FULL_REFRESH_MS = 60000

// Keeps a local copy of every user. Each poll asks only for changes since the last
// response, and a full refresh runs every minute so nothing is missed.
export function useLiveLocationUsers(intervalMs = 10000) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const byId = useRef(new Map())
  const since = useRef(0)
  const lastFull = useRef(0)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      const forceFull = Date.now() - lastFull.current > FULL_REFRESH_MS
      getLiveUsers(forceFull ? 0 : since.current)
        .then(({ data, serverTime, full }) => {
          if (cancelled) return
          if (full) {
            byId.current = new Map()
            lastFull.current = Date.now()
          }
          data.forEach((u) => byId.current.set(u.userId, u))
          since.current = serverTime
          setUsers([...byId.current.values()])
          setError(null)
        })
        .catch((err) => {
          if (cancelled) return
          setError(err.response?.data?.message || 'Could not load users.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    load()
    const timer = setInterval(load, intervalMs)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [intervalMs])

  return { users, loading, error }
}
