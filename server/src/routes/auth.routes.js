const express = require('express')
const authRouter = express.Router()

const { login, Logout, me } = require('../controllers/auth.controller')

authRouter.post('/login', login)
authRouter.post('/logout', Logout)
authRouter.get('/me', me)

module.exports = { authRouter }
