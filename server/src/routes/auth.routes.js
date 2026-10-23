const express = require('express')
const authRouter = express.Router()

const { login, Logout, me, getWsToken } = require('../controllers/auth.controller')

authRouter.post('/login', login)
authRouter.post('/logout', Logout)
authRouter.get('/me', me)
// Short-lived token for the WebSocket handshake (401s itself when there is no session)
authRouter.get('/ws-token', getWsToken)

module.exports = { authRouter }