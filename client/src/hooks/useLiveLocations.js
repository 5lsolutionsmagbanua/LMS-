import { useEffect, useState } from 'react'
import { getLiveLocations } from '../api/liveLocation.api'

export function useLiveLocations(intervalMs = 4000) {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      getLiveLocations()
        .then((list) => {
          if (!cancelled) setPositions(list)
        })
        .catch((err) => console.error('Live locations error:', err))
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

  return { positions, loading }
}