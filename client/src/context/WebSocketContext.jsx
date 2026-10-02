// src/context/WebSocketContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react'

const WebSocketContext = createContext(null)

const WS_ENABLED = false // 👈 flip to true when backend WS server is ready
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws'

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!WS_ENABLED) return // skip entirely — no connection attempt at all

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => setSocket(ws)
    ws.onclose = () => setSocket(null)
    ws.onerror = (err) => console.error('WebSocket error:', err)

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
    }
  }, [])

  return <WebSocketContext.Provider value={socket}>{children}</WebSocketContext.Provider>
}

export const useWebSocket = () => useContext(WebSocketContext)
