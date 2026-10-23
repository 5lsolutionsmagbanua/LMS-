const { WebSocketServer, WebSocket } = require('ws')
const jwt = require('jsonwebtoken')

const PING_INTERVAL = 30000
const WS_PATH = '/ws' // must match the Vite proxy and the client WS_URL
const DRIVER_ROLE = 'driver'

let wss = null

// Ids can differ in type or casing between the JWT and the DB; compare normalized.
const normId = (v) => (v == null ? '' : String(v).toLowerCase())

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET must be set for the WebSocket server')
  return secret
}

const initWebSocket = (server) => {
  wss = new WebSocketServer({ server, path: WS_PATH })
  console.log(`🚀 WebSocket Server Initialized on ${WS_PATH}`)

  wss.on('connection', (ws, req) => {
    ws.isAlive = true
    ws.on('error', (err) => console.warn('WS client error:', err.message))

    try {
      const token = new URL(req.url, 'http://localhost').searchParams.get('token')
      if (!token) throw new Error('Missing authentication token')

      const decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] })
      ws.userId = normId(decoded.userId ?? decoded.id ?? decoded.sub)
      ws.role = String(decoded.role || '').toLowerCase()
      ws.branchId = decoded.branchId
      console.log(`🔌 Client Connected: ${ws.role} (${ws.userId})`)
    } catch (error) {
      console.warn(`⛔ Connection Rejected: ${error.message}`)
      ws.close(4001, 'Unauthorized')
      return
    }

    ws.on('pong', () => {
      ws.isAlive = true
    })
  })

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate()
      ws.isAlive = false
      ws.ping()
    })
  }, PING_INTERVAL)

  wss.on('close', () => clearInterval(interval))
}

const sendWhere = (predicate, payload, eventType) => {
  if (!wss) return
  try {
    const message = JSON.stringify({ type: eventType, data: payload })
    let sent = 0
    wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN && predicate(c)) {
        c.send(message)
        sent += 1
      }
    })
    console.debug(`[WS] "${eventType}" delivered to ${sent} client(s)`)
  } catch (err) {
    console.warn('WS broadcast failed:', err.message) // never break the request
  }
}

const broadcastToUser = (userId, payload, type = 'NOTIFICATION') => {
  const target = normId(userId)
  sendWhere((c) => c.userId === target, payload, type)
}

const broadcastToAll = (payload, type = 'NOTIFICATION') => sendWhere(() => true, payload, type)

const broadcastToRoles = (roles, payload, type = 'NOTIFICATION') => {
  const wanted = roles.map((r) => String(r).toLowerCase())
  sendWhere((c) => wanted.includes(c.role), payload, type)
}

// `_req` is accepted and ignored so existing controller calls keep working.
const emitToUser = (_req, userId, type, payload) => broadcastToUser(userId, payload, type)
const emitToStaff = (_req, type, payload) => sendWhere((c) => c.role !== DRIVER_ROLE, payload, type)

module.exports = {
  initWebSocket,
  broadcastToUser,
  broadcastToAll,
  broadcastToRoles,
  emitToUser,
  emitToStaff,
}