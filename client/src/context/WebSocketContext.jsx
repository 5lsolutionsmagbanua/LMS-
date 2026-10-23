import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiClient } from '../api/axios'
import { useAuth } from '../hooks/useAuth'

const WS_ENABLED = true
const WS_URL =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`
const BASE_DELAY_MS = 2000
const MAX_DELAY_MS = 30000

const WebSocketContext = createContext({ socket: null, connected: false })

export function WebSocketProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.userId
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!WS_ENABLED || !userId) return undefined

    let ws = null
    let retryTimer = null
    let disposed = false
    let attempt = 0

    // Keep retrying (delay capped at MAX_DELAY_MS) so a server restart or a
    // sleeping phone never leaves the driver permanently disconnected.
    const scheduleRetry = () => {
      const delay = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS)
      attempt = Math.min(attempt + 1, 10)
      retryTimer = setTimeout(connect, delay)
    }

    const connect = async () => {
      try {
        const { data } = await apiClient.get('/auth/ws-token')
        if (disposed) return

        ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(data.token)}`)
        ws.onopen = () => {
          attempt = 0
          if (!disposed) setSocket(ws)
        }
        ws.onclose = (e) => {
          if (disposed) return
          setSocket(null)
          if (e.code === 4001) return // unauthorized: retrying won't help
          scheduleRetry()
        }
        ws.onerror = (err) => console.error('WebSocket error:', err)
      } catch (err) {
        const status = err?.response?.status
        if (!disposed && status !== 401 && status !== 403) scheduleRetry()
      }
    }

    connect()

    return () => {
      disposed = true
      clearTimeout(retryTimer)
      setSocket(null)
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close()
      }
    }
  }, [userId])

  const value = useMemo(() => ({ socket, connected: !!socket }), [socket])

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}

export const useWebSocket = () => useContext(WebSocketContext)
