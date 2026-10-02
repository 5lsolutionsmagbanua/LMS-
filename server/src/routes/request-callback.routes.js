const express = require('express')
const requestCallbackRouter = express.Router()

const { handleRequestCallback } = require('../controllers/requestCallback.controller')
const { verifyCallbackSignature } = require('../middlewares/verifyCallbackSignature')

// This is called BY the other system, not by a logged-in admin user — so it
// uses signature verification instead of session auth or x-api-key.
// Mounted at the top-level path /request-callback (see routes.startup.js).
requestCallbackRouter.post('/', verifyCallbackSignature, handleRequestCallback)

module.exports = { requestCallbackRouter }
