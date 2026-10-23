const {
  upsertPosition,
  removePosition,
  getActivePositions,
  touchPresence,
  getOnlineUserIds,
} = require('../services/live-location.service')
const { getDirectory } = require('../services/live-location-directory.service')
const {
  validateFix,
  validateDeviceQuery,
  validateUserId,
} = require('../utilities/live-location-validation.util')

const displayName = (user) => user.name || user.username || 'Unknown'

const badRequest = (res, errors) => res.status(400).json({ message: 'Invalid request', errors })

const requireUser = (req, res) => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Unauthorized. Please log in.' })
    return null
  }
  return req.user
}

const getLiveLocations = (req, res) => {
  // #swagger.tags = ['Live Location']
  // #swagger.description = 'Calibrated positions of users sharing their location'
  if (!requireUser(req, res)) return
  return res.status(200).json({ data: getActivePositions() })
}

const heartbeat = (req, res) => {
  // #swagger.tags = ['Live Location']
  // #swagger.description = 'Mark the logged-in user as active'
  const user = requireUser(req, res)
  if (!user) return

  touchPresence(String(user.id))
  return res.status(200).json({ ok: true })
}

/**
 * @name listUsers
 * @description Every active user with status. Pass ?since=<ms timestamp> to receive
 *              only users whose status or position changed after that time.
 *              The response includes `serverTime`; the client sends it back as `since`.
 */
const listUsers = async (req, res) => {
  // #swagger.tags = ['Live Location']
  // #swagger.description = 'Registered users with presence and location status'
  if (!requireUser(req, res)) return

  const serverTime = Date.now()
  const since = Number(req.query.since) || 0

  try {
    const directory = await getDirectory()
    const livePositions = new Map(getActivePositions().map((p) => [p.userId, p]))
    const onlineIds = getOnlineUserIds()

    const all = directory.map((u) => {
      const pos = livePositions.get(u.userId)

      let status = 'offline'
      if (pos) status = 'live'
      else if (onlineIds.has(u.userId)) status = 'online'

      return {
        ...u,
        status,
        sharing: Boolean(pos),
        lat: pos?.lat ?? null,
        lng: pos?.lng ?? null,
        accuracy: pos?.accuracy ?? null,
        accuracyBand: pos?.accuracyBand ?? null,
        calibrated: pos?.calibrated ?? false,
        samples: pos?.samples ?? 0,
        rejected: pos?.rejected ?? 0,
        site: pos?.site ?? null,
        rawLat: pos?.rawLat ?? null,
        rawLng: pos?.rawLng ?? null,
        rawAccuracy: pos?.rawAccuracy ?? null,
        flags: pos?.flags ?? [],
        deviceCount: pos?.deviceCount ?? 0,
        updatedAt: pos?.updatedAt ?? null,
        ageSeconds: pos ? Math.round((serverTime - pos.updatedAt) / 1000) : null,
      }
    })

    // Delta: a user is included if anything about them changed since `since`.
    // A user who went offline is included too, because their status changed.
    const changed = since
      ? all.filter((u) => {
          const pos = livePositions.get(u.userId)
          const posChanged = pos && pos.updatedAt > since
          const statusChanged = u.statusChangedAt != null && u.statusChangedAt > since
          return posChanged || statusChanged || (u.status === 'offline' && since === 0)
        })
      : all

    const rank = { live: 0, online: 1, offline: 2 }
    changed.sort((a, b) => rank[a.status] - rank[b.status] || a.name.localeCompare(b.name))

    return res.status(200).json({ data: changed, serverTime, full: !since })
  } catch (error) {
    console.error('List Live Users Exception:', error)
    return res.status(500).json({ message: 'Error loading users' })
  }
}

const getUserLocation = (req, res) => {
  // #swagger.tags = ['Live Location']
  // #swagger.description = 'Position of a single user who is sharing their location'
  if (!requireUser(req, res)) return

  const { errors, value: targetId } = validateUserId(req.params.userId)
  if (errors) return badRequest(res, errors)

  const position = getActivePositions().find((p) => p.userId === targetId)
  if (!position) {
    return res.status(404).json({ message: 'This user is not sharing their location right now.' })
  }

  return res.status(200).json({
    data: { ...position, ageSeconds: Math.round((Date.now() - position.updatedAt) / 1000) },
  })
}

const updateLocation = (req, res) => {
  // #swagger.tags = ['Live Location']
  // #swagger.description = "Report the logged-in user's current position from one device"
  const user = requireUser(req, res)
  if (!user) return

  const { errors, value } = validateFix(req.body)
  if (errors) return badRequest(res, errors)

  try {
    const entry = upsertPosition({
      userId: String(user.id),
      deviceId: value.deviceId,
      name: displayName(user),
      role: user.roleName ?? user.role ?? null,
      branchId: user.branchId ?? null,
      lat: value.lat,
      lng: value.lng,
      accuracy: value.accuracy == null ? null : Math.round(value.accuracy),
      speed: value.speed,
      heading: value.heading,
      altitude: value.altitude,
    })
    touchPresence(String(user.id))
    return res.status(200).json({ ok: true, data: entry })
  } catch (error) {
    console.error('Update Live Location Exception:', error)
    return res.status(500).json({ message: 'Error saving your location' })
  }
}

const clearLocation = (req, res) => {
  // #swagger.tags = ['Live Location']
  // #swagger.description = "Stop sharing the logged-in user's location"
  const user = requireUser(req, res)
  if (!user) return

  const hasDevice = req.query?.deviceId !== undefined
  const { errors, value } = validateDeviceQuery(req.query)
  if (errors) return badRequest(res, errors)

  try {
    removePosition(String(user.id), hasDevice ? value.deviceId : null)
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Clear Live Location Exception:', error)
    return res.status(500).json({ message: 'Error clearing your location' })
  }
}

module.exports = {
  getLiveLocations,
  heartbeat,
  listUsers,
  getUserLocation,
  updateLocation,
  clearLocation,
}
