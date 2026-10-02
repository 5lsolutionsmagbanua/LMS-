/**
 * @name apiKeyAuth
 * @description Gate for externally-exposed endpoints. No session/JWT involved —
 * the calling system just sends the shared key on every request:
 *   header: x-api-key: <API_KEY>
 */
const apiKeyAuth = (req, res, next) => {
  const providedKey = req.header('x-api-key')
  const expectedKey = process.env.API_KEY

  if (!expectedKey) {
    return res.status(500).json({ message: 'API_KEY is not configured on the server' })
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ message: 'Invalid or missing API key' })
  }

  next()
}

module.exports = { apiKeyAuth }
