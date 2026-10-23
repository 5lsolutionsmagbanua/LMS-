import { useEffect, useRef } from 'react'
import { useWebSocket } from '../context/WebSocketContext'

/**
 * Run `handler(msg)` whenever the server pushes a message whose `type` is in `types`.
 * Safe when the socket is null (WS disabled, not connected yet, or reconnecting).
 */
export function useWsEvents(types, handler) {
  const { socket } = useWebSocket()
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  const key = types.join('|')

  useEffect(() => {
    if (!socket) return undefined
    const wanted = key.split('|')

    const onMessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (wanted.includes(msg.type)) handlerRef.current(msg)
      } catch {
        /* ignore malformed frames */
      }
    }

    socket.addEventListener('message', onMessage)
    return () => socket.removeEventListener('message', onMessage)
  }, [socket, key])
}