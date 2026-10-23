import { useCallback, useEffect, useRef, useState } from 'react'
import { getMyDispatches, getMyPerformance } from '../api/driverDispatch.api'
import { useWebSocket } from '../context/WebSocketContext'
import { useWsEvents } from './useWsEvents'

const POLL_MS = 15000

export function useDriverDispatches(tab = 'active') {
  const { socket } = useWebSocket()
  const [dispatches, setDispatches] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newAssignment, setNewAssignment] = useState(false)

  const reqId = useRef(0)
  const knownIds = useRef(null) // null until the first load finishes

  const load = useCallback(
    async (silent = false) => {
      const id = ++reqId.current
      if (!silent) setLoading(true)
      try {
        const [listRes, statsRes] = await Promise.allSettled([
          getMyDispatches(tab),
          getMyPerformance(),
        ])
        if (id !== reqId.current) return // a newer request superseded this one

        if (listRes.status === 'fulfilled') {
          const list = listRes.value
          // Detect a new delivery from the data itself (works with or without WS)
          if (tab === 'active' && knownIds.current) {
            if (list.some((d) => !knownIds.current.has(d.id))) setNewAssignment(true)
          }
          knownIds.current = new Set(list.map((d) => d.id))
          setDispatches(list)
          setError('')
        } else {
          setError(listRes.reason?.response?.data?.message || 'Could not load your deliveries')
        }
        if (statsRes.status === 'fulfilled') setStats(statsRes.value)
      } finally {
        if (id === reqId.current) setLoading(false)
      }
    },
    [tab],
  )

  // Initial load + reset when the tab changes
  useEffect(() => {
    knownIds.current = null
    load()
  }, [load])

  // Catch-up: every time the socket (re)connects, refetch. This covers any push
  // that was sent while the socket was still connecting or had dropped.
  useEffect(() => {
    if (socket) load(true)
  }, [socket, load])

  // Fallback: poll while visible, and refetch when the app regains focus
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') load(true)
    }
    const timer = setInterval(tick, POLL_MS)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('focus', tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('focus', tick)
    }
  }, [load])

  // Instant path: any push for this driver triggers a silent refetch
  useWsEvents(['dispatch:assigned', 'dispatch:unassigned', 'dispatch:status'], () => {
    load(true)
  })

  return {
    dispatches,
    stats,
    loading,
    error,
    newAssignment,
    dismissNewAssignment: () => setNewAssignment(false),
    reload: () => load(true),
  }
}