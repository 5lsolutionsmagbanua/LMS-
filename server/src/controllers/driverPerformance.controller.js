// server/src/controllers/driverPerformance.controller.js
const { Query } = require('../database/utilities/queries.util')
const { ROLES } = require('../database/constants/roles')

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isValidUUID = (v) => typeof v === 'string' && UUID_REGEX.test(v)

// NEW: roles that may look at ANY branch. Everyone else with the
// driver_performance permission (e.g. Manager) is pinned to their own branch.
// Adjust to your policy.
const ALL_BRANCH_ROLES = [ROLES.ADMIN, ROLES.DEVELOPER, ROLES.PRESIDENT]

// ── Date range ─────────────────────────────────────────────────────────────
// CHANGED: dates are parsed as LOCAL calendar days. `new Date('2026-10-10')` is
// UTC midnight, which shifts the window by the server's UTC offset (8 hours in
// the Philippines) and drops or adds the first/last hours of each day.
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

// undefined = not provided, null = invalid, Date = parsed
const parseDay = (value) => {
  if (value === undefined || value === '') return undefined
  if (typeof value !== 'string') return null
  if (DATE_ONLY.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.getMonth() === m - 1 ? date : null // rejects 2026-02-31
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// Default window = last 30 days including today. `to` is inclusive.
const resolveRange = (from, to) => {
  const fromDate = parseDay(from)
  const toDate = parseDay(to)
  if (fromDate === null || toDate === null) return null

  const endDay = toDate ? startOfDay(toDate) : startOfDay(new Date())
  const start = fromDate ? startOfDay(fromDate) : addDays(endDay, -29)
  const endExclusive = addDays(endDay, 1)

  if (start >= endExclusive) return null
  return { start, endExclusive }
}

const RANGE_ERROR = 'from/to must be valid dates (YYYY-MM-DD) with from on or before to'

// ── Summary query ──────────────────────────────────────────────────────────
const SUMMARY_SELECT = `
  dp.dp_driverId                                         AS driverId,
  CONCAT(u.mu_first_name, ' ', u.mu_last_name)           AS driverName,
  COUNT(*)                                               AS totalAssigned,
  SUM(dp.dp_finalStatus = 'completed')                   AS completed,
  SUM(dp.dp_finalStatus = 'cancelled')                   AS cancelled,
  SUM(dp.dp_finalStatus IN ('assigned','en_route','arrived')) AS inProgress,
  ROUND(AVG(dp.dp_responseSeconds) / 60, 1)              AS avgResponseMin,
  ROUND(AVG(dp.dp_transitSeconds)  / 60, 1)              AS avgTransitMin,
  ROUND(AVG(dp.dp_unloadSeconds)   / 60, 1)              AS avgUnloadMin,
  ROUND(AVG(dp.dp_totalSeconds)    / 60, 1)              AS avgTotalMin,
  ROUND(100 * SUM(dp.dp_finalStatus = 'completed')
        / NULLIF(SUM(dp.dp_finalStatus IN ('completed','cancelled')), 0), 1) AS completionRate`

// CHANGED: mysql2 returns SUM() and ROUND() results (DECIMAL) as strings, so
// "12.3".toFixed() would throw in the UI. Convert every numeric column.
const num = (v) => (v === null || v === undefined ? null : Number(v))

const normalize = (r) => ({
  ...r,
  totalAssigned: Number(r.totalAssigned),
  completed: Number(r.completed),
  cancelled: Number(r.cancelled),
  inProgress: Number(r.inProgress),
  avgResponseMin: num(r.avgResponseMin),
  avgTransitMin: num(r.avgTransitMin),
  avgUnloadMin: num(r.avgUnloadMin),
  avgTotalMin: num(r.avgTotalMin),
  completionRate: num(r.completionRate),
})

/**
 * @name getDriverPerformance
 * @description Per-driver performance summary (admin / manager view).
 *              ?from=YYYY-MM-DD &to=YYYY-MM-DD &driverId= &branchId=
 *              Roles outside ALL_BRANCH_ROLES only ever see their own branch.
 */
const getDriverPerformance = async (req, res) => {
  // #swagger.tags = ['Dispatch']
  // #swagger.description = 'Driver performance summary based on dispatch status timings'
  const { from, to, driverId } = req.query
  let { branchId } = req.query

  const range = resolveRange(from, to)
  if (!range) return res.status(400).json({ message: RANGE_ERROR })

  // NEW: branch scoping. The permission matrix says WHO may read this report, not
  // WHICH branch; without this a Manager could read every branch by passing branchId.
  if (!ALL_BRANCH_ROLES.includes(req.user?.roleName)) {
    if (!req.user?.branchId) {
      return res.status(403).json({ message: 'Your account is not linked to a branch' })
    }
    branchId = req.user.branchId
  }

  const where = ['dp.dp_assignedAt >= ?', 'dp.dp_assignedAt < ?']
  const bindings = [range.start, range.endExclusive]
  for (const [label, value, col] of [
    ['driverId', driverId, 'dp.dp_driverId'],
    ['branchId', branchId, 'dp.dp_branchId'],
  ]) {
    if (!value) continue
    if (!isValidUUID(value))
      return res.status(400).json({ message: `${label} must be a valid UUID` })
    where.push(`${col} = ?`)
    bindings.push(value)
  }

  try {
    const rows = await Query(
      `SELECT ${SUMMARY_SELECT}
         FROM driver_performance dp
         JOIN master_users u ON u.mu_id = dp.dp_driverId
        WHERE ${where.join(' AND ')}
        GROUP BY dp.dp_driverId, u.mu_first_name, u.mu_last_name
        ORDER BY completed DESC, driverName`,
      bindings,
    )
    return res.status(200).json((rows || []).map(normalize))
  } catch (error) {
    console.error('Get Driver Performance Exception:', error)
    return res.status(500).json({ message: 'Error retrieving driver performance' })
  }
}

/**
 * @name getMyPerformance
 * @description Performance summary of the logged-in driver.
 */
const getMyPerformance = async (req, res) => {
  // #swagger.tags = ['Dispatch']
  // #swagger.description = 'Performance summary of the logged-in driver'
  const userId = req.user?.id ?? req.session?.userId ?? null
  if (!userId) return res.status(401).json({ message: 'Unauthorized. Please log in.' })

  const range = resolveRange(req.query.from, req.query.to)
  if (!range) return res.status(400).json({ message: RANGE_ERROR })

  try {
    const rows = await Query(
      `SELECT ${SUMMARY_SELECT}
         FROM driver_performance dp
         JOIN master_users u ON u.mu_id = dp.dp_driverId
        WHERE dp.dp_driverId = ? AND dp.dp_assignedAt >= ? AND dp.dp_assignedAt < ?
        GROUP BY dp.dp_driverId, u.mu_first_name, u.mu_last_name`,
      [userId, range.start, range.endExclusive],
    )
    const empty = {
      totalAssigned: 0,
      completed: 0,
      cancelled: 0,
      inProgress: 0,
      avgResponseMin: null,
      avgTransitMin: null,
      avgUnloadMin: null,
      avgTotalMin: null,
      completionRate: null,
    }
    return res.status(200).json(rows?.[0] ? normalize(rows[0]) : empty)
  } catch (error) {
    console.error('Get My Performance Exception:', error)
    return res.status(500).json({ message: 'Error retrieving your performance' })
  }
}

module.exports = { getDriverPerformance, getMyPerformance }