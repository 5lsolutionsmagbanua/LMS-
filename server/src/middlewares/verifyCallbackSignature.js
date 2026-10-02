// middleware/verifyCallbackSignature.js
const crypto = require('crypto')

const verifyCallbackSignature = (req, res, next) => {
  const signature = req.headers['x-signature']
  const timestamp = req.headers['x-timestamp']

  if (!signature || !timestamp) {
    return res.status(401).json({ message: 'Missing signature headers' })
  }

  // Reject stale callbacks (replay protection) — 5 minute window
  const age = Date.now() - Number(timestamp)
  if (Number.isNaN(age) || age > 5 * 60 * 1000 || age < 0) {
    return res.status(401).json({ message: 'Stale or invalid timestamp' })
  }

  const payload = `${timestamp}.${JSON.stringify(req.body)}`
  const expected = crypto
    .createHmac('sha256', process.env.CALLBACK_SIGNING_SECRET)
    .update(payload)
    .digest('hex')

  const provided = Buffer.from(signature, 'hex')
  const computed = Buffer.from(expected, 'hex')

  if (provided.length !== computed.length || !crypto.timingSafeEqual(provided, computed)) {
    return res.status(401).json({ message: 'Invalid signature' })
  }

  next()
}

module.exports = { verifyCallbackSignature }
