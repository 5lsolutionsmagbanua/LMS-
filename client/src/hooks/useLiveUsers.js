import { useEffect, useState } from 'react'
import { getLiveUsers } from '../api/live-location.api'

export function useLiveUsers(intervalMs = 4000) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      getLiveUsers()
        .then((list) => {
          if (cancelled) return
          setUsers(list)
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
