// Validation for live location requests.
// Each validator returns { errors, value }. Errors are keyed by field name, or null when valid.

const DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/
const USER_ID_PATTERN = /^[A-Za-z0-9-]{1,64}$/

const isNumber = (v) => typeof v === 'number' && Number.isFinite(v)
const isMissing = (v) => v === undefined || v === null

const checkRange = (errors, value, field, min, max, { optional = false } = {}) => {
  if (isMissing(value)) {
    if (!optional) errors[field] = `${field} is required`
    return null
  }
  if (!isNumber(value) || value < min || value > max) {
    errors[field] = `${field} must be a number between ${min} and ${max}`
    return null
  }
  return value
}

const checkDeviceId = (errors, value) => {
  if (isMissing(value) || value === '') return 'default'
  if (typeof value !== 'string' || !DEVICE_ID_PATTERN.test(value)) {
    errors.deviceId = 'deviceId must be 8 to 64 letters, digits, "-" or "_"'
    return null
  }
  return value
}

/** Body of POST /api/live-location */
const validateFix = (body) => {
  const errors = {}
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: { body: 'Request body must be a JSON object' }, value: null }
  }

  const value = {
    lat: checkRange(errors, body.lat, 'lat', -90, 90),
    lng: checkRange(errors, body.lng, 'lng', -180, 180),
    accuracy: checkRange(errors, body.accuracy, 'accuracy', 0, 100000, { optional: true }),
    speed: checkRange(errors, body.speed, 'speed', 0, 200, { optional: true }),
    heading: checkRange(errors, body.heading, 'heading', 0, 360, { optional: true }),
    altitude: checkRange(errors, body.altitude, 'altitude', -500, 9000, { optional: true }),
    deviceId: checkDeviceId(errors, body.deviceId),
  }

  return { errors: Object.keys(errors).length ? errors : null, value }
}

/** Query of DELETE /api/live-location */
const validateDeviceQuery = (query) => {
  const errors = {}
  const deviceId = checkDeviceId(errors, query?.deviceId)
  return { errors: Object.keys(errors).length ? errors : null, value: { deviceId } }
}

/** Route parameter for a single user */
const validateUserId = (userId) => {
  if (typeof userId !== 'string' || !USER_ID_PATTERN.test(userId)) {
    return { errors: { userId: 'userId is not valid' }, value: null }
  }
  return { errors: null, value: userId }
}

module.exports = { validateFix, validateDeviceQuery, validateUserId }
