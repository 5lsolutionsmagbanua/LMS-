import { useEffect, useState } from 'react'
import { getUserLocation } from '../api/liveLocation.api'

export function useUserLocation(userId, intervalMs = 4000) {
  const [state, setState] = useState({ data: null, error: null, loading: false })

  useEffect(() => {
    if (!userId) {
      setState({ data: null, error: null, loading: false })
      return
    }

    let cancelled = false

    const load = () => {
      setState((s) => ({ ...s, loading: true }))
      getUserLocation(userId)
        .then((data) => {
          if (!cancelled) setState({ data, error: null, loading: false })
        })
        .catch((err) => {
          if (cancelled) return
          const notSharing = err.response?.status === 404
          setState({
            data: null,
            error: notSharing ? 'Not sharing location right now.' : 'Could not load location.',
            loading: false,
          })
        })
    }

    load()
    const timer = setInterval(load, intervalMs)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [userId, intervalMs])

  return state
}
