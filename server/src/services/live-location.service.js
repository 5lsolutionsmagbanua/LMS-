const { distanceMeters } = require('../utilities/live-location-distance.util')
const { LIVE_LOCATION_SITES } = require('../config/live-location-sites')

const STALE_MS = 2 * 60 * 1000 // no fix or heartbeat for 2 minutes = not active
const RECENT_MS = 60 * 1000 // readings older than this don't count toward calibration
const HISTORY_SIZE = 5 // readings kept per device for smoothing
const MAX_SPEED_MPS = 42 // about 150 km/h
const OUTLIER_MIN_M = 50 // readings this far from the group are rejected
const MIN_ACCURACY_M = 5 // stops a zero-accuracy reading from dominating the average

const devices = new Map() // userId -> Map<deviceId, entry>
const presence = new Map() // userId -> { lastSeen }

const accuracyBand = (m) => {
  if (m == null) return 'unknown'
  if (m <= 100) return 'precise'
  if (m <= 1000) return 'approximate'
  return 'coarse'
}

const median = (nums) => {
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

// Reasons a fix may be fake. These are review prompts, not proof.
const scoreFix = (prev, next) => {
  const flags = []
  if (next.speed == null && next.heading == null && next.altitude == null) {
    flags.push('no_sensor_data')
  }
  if (next.accuracy === 0) flags.push('zero_accuracy')
  if (prev) {
    const seconds = (Date.now() - prev.updatedAt) / 1000
    if (seconds > 0 && distanceMeters(prev, next) / seconds > MAX_SPEED_MPS) {
      flags.push('impossible_speed')
    }
  }
  return flags
}

/**
 * Smooths a device's recent readings into one position.
 * 1. Keep readings from the last minute.
 * 2. Reject readings far from the group's median point.
 * 3. Average the rest, weighting each by 1 / accuracy squared.
 */
const calibrate = (history, now) => {
  const recent = history.filter((f) => now - f.at <= RECENT_MS)
  if (recent.length === 0) return null

  const center = {
    lat: median(recent.map((f) => f.lat)),
    lng: median(recent.map((f) => f.lng)),
  }

  const kept = recent.filter(
    (f) => distanceMeters(f, center) <= Math.max(OUTLIER_MIN_M, (f.accuracy ?? 100) * 3),
  )
  const pool = kept.length ? kept : [recent[recent.length - 1]]

  let sumW = 0
  let sumLat = 0
  let sumLng = 0
  let bestAcc = Infinity

  for (const f of pool) {
    const acc = Math.max(f.accuracy ?? 100, MIN_ACCURACY_M)
    const w = 1 / (acc * acc)
    sumW += w
    sumLat += w * f.lat
    sumLng += w * f.lng
    bestAcc = Math.min(bestAcc, acc)
  }

  return {
    lat: sumLat / sumW,
    lng: sumLng / sumW,
    accuracy: Math.round(Math.min(bestAcc, 1 / Math.sqrt(sumW))),
    samples: pool.length,
    rejected: recent.length - pool.length,
  }
}

const siteFor = (lat, lng) => {
  for (const site of LIVE_LOCATION_SITES) {
    if (distanceMeters({ lat, lng }, site) <= site.radius) return site.name
  }
  return null
}

const upsertPosition = ({
  userId,
  deviceId,
  name,
  role,
  branchId,
  lat,
  lng,
  accuracy,
  speed,
  heading,
  altitude,
}) => {
  let byDevice = devices.get(userId)
  if (!byDevice) {
    byDevice = new Map()
    devices.set(userId, byDevice)
  }

  const now = Date.now()
  const prev = byDevice.get(deviceId)
  const history = [...(prev?.history ?? []), { lat, lng, accuracy, at: now }].slice(-HISTORY_SIZE)
  const cal = calibrate(history, now) ?? { lat, lng, accuracy, samples: 1, rejected: 0 }

  const entry = {
    userId,
    deviceId,
    name,
    role,
    branchId,
    lat: cal.lat,
    lng: cal.lng,
    accuracy: cal.accuracy,
    accuracyBand: accuracyBand(cal.accuracy),
    calibrated: cal.samples > 1,
    samples: cal.samples,
    rejected: cal.rejected,
    site: siteFor(cal.lat, cal.lng),
    rawLat: lat,
    rawLng: lng,
    rawAccuracy: accuracy,
    speed,
    heading,
    altitude,
    flags: scoreFix(
      prev ? { lat: prev.rawLat, lng: prev.rawLng, updatedAt: prev.updatedAt } : null,
      { lat, lng, accuracy, speed, heading, altitude },
    ),
    history,
    updatedAt: now,
  }

  byDevice.set(deviceId, entry)
  return entry
}

const pruneStale = () => {
  const now = Date.now()
  for (const [userId, byDevice] of devices) {
    for (const [deviceId, e] of byDevice) {
      if (now - e.updatedAt > STALE_MS) byDevice.delete(deviceId)
    }
    if (byDevice.size === 0) devices.delete(userId)
  }
}

const toPublic = ({ history, ...rest }) => rest

// One position per user: the most accurate calibrated reading from recent devices
const getActivePositions = () => {
  pruneStale()
  const now = Date.now()
  const result = []

  for (const byDevice of devices.values()) {
    const all = [...byDevice.values()]
    const recent = all.filter((e) => now - e.updatedAt <= RECENT_MS)
    const pool = recent.length ? recent : all

    pool.sort(
      (a, b) => (a.accuracy ?? Infinity) - (b.accuracy ?? Infinity) || b.updatedAt - a.updatedAt,
    )
    result.push({ ...toPublic(pool[0]), deviceCount: all.length })
  }
  return result
}

const removePosition = (userId, deviceId) => {
  if (!deviceId) {
    devices.delete(userId)
    return
  }
  const byDevice = devices.get(userId)
  if (!byDevice) return
  byDevice.delete(deviceId)
  if (byDevice.size === 0) devices.delete(userId)
}

const touchPresence = (userId) => {
  presence.set(userId, { lastSeen: Date.now() })
}

const getOnlineUserIds = () => {
  const now = Date.now()
  for (const [id, p] of presence) {
    if (now - p.lastSeen > STALE_MS) presence.delete(id)
  }
  return new Set(presence.keys())
}

// Called on sign-in: the user is online straight away
const markOnline = (userId) => {
  touchPresence(String(userId))
}

// Called on sign-out: clears presence, every device's position, and calibration history
const markOffline = (userId) => {
  const id = String(userId)
  presence.delete(id)
  devices.delete(id)
}

module.exports = {
  upsertPosition,
  removePosition,
  getActivePositions,
  touchPresence,
  getOnlineUserIds,
  markOnline,
  markOffline,
}
