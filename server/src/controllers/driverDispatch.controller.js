// server/src/controllers/driverDispatch.controller.js
// Driver-side endpoints: list my dispatches, advance delivery status.
const { REQUEST_STATUS, canTransition } = require('../database/constants/requestStatus')
const { Query, Transaction } = require('../database/utilities/queries.util')
const driverPerf = require('../services/driverPerformance.service')
const { emitToUser, emitToStaff } = require('../utilities/realtime.util')

const ACTIVE_STATUSES = ['assigned', 'en_route', 'arrived']
const HISTORY_STATUSES = ['completed', 'cancelled']
const LIST_LIMIT = 100 // NEW: history grows forever, cap what one request returns

/**
 * One rule per driver action. A transition is allowed only when BOTH the
 * dispatch status and the pending-request status match, so the driver can never
 * push a delivery for a request that was cancelled/failed/changed elsewhere.
 *
 *  from                  allowed current dispatch statuses
 *  requestFrom           allowed current pending-request statuses
 *  requestTo             new pending-request status (null = leave unchanged)
 *  dmStatus              value written to dispatch_monitoring.dm_status
 *  tsCol                 timestamp column to stamp
 *  frees                 release the vehicle (back to 'Available')
 *  skipTransitionCheck   requestFrom is already the full list of legal states,
 *                        so don't also consult the global transition map
 */
const DRIVER_ACTIONS = {
  en_route: {
    from: ['assigned'],
    requestFrom: [REQUEST_STATUS.READY_FOR_DISPATCH],
    requestTo: REQUEST_STATUS.DISPATCHED,
    dmStatus: 'en_route',
    tsCol: 'dm_departedAt',
  },
  arrived: {
    from: ['en_route'],
    requestFrom: [REQUEST_STATUS.DISPATCHED],
    requestTo: null,
    dmStatus: 'arrived',
    tsCol: 'dm_arrivedAt',
  },
  completed: {
    from: ['arrived'],
    requestFrom: [REQUEST_STATUS.DISPATCHED],
    requestTo: null, // request flow ends at 'dispatched'
    dmStatus: 'completed',
    tsCol: 'dm_completedAt',
    frees: true,
  },
  // Driver cannot deliver: dispatch is cancelled, request becomes 'failed'
  // (your map lets 'failed' go back to 'pending' so it can be re-approved).
  failed: {
    from: ['assigned', 'en_route', 'arrived'],
    requestFrom: [REQUEST_STATUS.READY_FOR_DISPATCH, REQUEST_STATUS.DISPATCHED],
    requestTo: REQUEST_STATUS.FAILED,
    dmStatus: 'cancelled',
    tsCol: 'dm_cancelledAt',
    frees: true,
    requiresRemarks: true,
    // CHANGED: ALLOWED_TRANSITIONS has no dispatched -> failed edge, so a driver
    // who had already left (or arrived) got a 409 when reporting a failed delivery.
    skipTransitionCheck: true,
  },
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isValidUUID = (v) => typeof v === 'string' && UUID_REGEX.test(v)
const placeholders = (arr) => arr.map(() => '?').join(', ')

/**
 * @name getMyDispatches
 * @description Dispatches assigned to the logged-in driver. ?status=active|history
 */
const getMyDispatches = async (req, res) => {
  // #swagger.tags = ['Dispatch']
  // #swagger.description = 'List dispatches assigned to the logged-in driver'
  const userId = req.user?.id ?? req.session?.userId ?? null
  if (!userId) return res.status(401).json({ message: 'Unauthorized. Please log in.' })

  const statuses = req.query.status === 'history' ? HISTORY_STATUSES : ACTIVE_STATUSES

  try {
    const rows = await Query(
      `SELECT dm.dm_id            AS id,
              pr.pr_id            AS pendingRequestId,
              pr.pr_requestId     AS requestId,
              pr.pr_ticketNumber  AS ticketNumber,
              pr.pr_requestType   AS requestType,
              pr.pr_status        AS requestStatus,
              dm.dm_status        AS status,
              v.mv_plate_number   AS vehiclePlateNumber,
              s.ms_store_name     AS targetStoreName,
              b.mb_branch_name    AS originBranchName,
              dm.dm_assignedAt    AS assignedAt,
              dm.dm_departedAt    AS departedAt,
              dm.dm_arrivedAt     AS arrivedAt,
              dm.dm_completedAt   AS completedAt,
              dm.dm_remarks       AS remarks
         FROM dispatch_monitoring dm
         JOIN pending_request pr ON pr.pr_id = dm.dm_pendingRequestId
         JOIN master_vehicles v  ON v.mv_id  = dm.dm_vehicleId
         JOIN master_stores s    ON s.ms_id  = dm.dm_targetStoreId
         JOIN master_branch b    ON b.mb_id  = dm.dm_branchId
        WHERE dm.dm_driverId = ?
          AND dm.dm_status IN (${placeholders(statuses)})
        ORDER BY dm.dm_assignedAt DESC
        LIMIT ${LIST_LIMIT}`,
      [userId, ...statuses],
    )

    // CHANGED: one items query for the whole page instead of one per dispatch.
    const list = rows || []
    const requestIds = list.map((r) => r.pendingRequestId)
    const itemRows = requestIds.length
      ? await Query(
          `SELECT pri_pendingRequestId AS pendingRequestId,
                  pri_stockId          AS stockId,
                  pri_stockQty         AS stockQty,
                  pri_assetTag         AS assetTag,
                  pri_serialNumber     AS serialNumber
             FROM pending_request_item
            WHERE pri_pendingRequestId IN (${placeholders(requestIds)})`,
          requestIds,
        )
      : []

    const itemsByRequest = new Map()
    for (const { pendingRequestId, ...item } of itemRows || []) {
      if (!itemsByRequest.has(pendingRequestId)) itemsByRequest.set(pendingRequestId, [])
      itemsByRequest.get(pendingRequestId).push(item)
    }

    const withItems = list.map(({ pendingRequestId, ...r }) => ({
      ...r,
      items: itemsByRequest.get(pendingRequestId) || [],
    }))

    return res.status(200).json(withItems)
  } catch (error) {
    console.error('Get My Dispatches Exception:', error)
    return res.status(500).json({ message: 'Error retrieving your dispatches' })
  }
}

/**
 * @name updateDispatchStatus
 * @description Driver advances a dispatch. body: { status, remarks? }
 *              status: en_route | arrived | completed | failed (failed needs remarks)
 *              Validated against BOTH dispatch status and pending-request status.
 */
const updateDispatchStatus = async (req, res) => {
  // #swagger.tags = ['Dispatch']
  // #swagger.description = 'Driver updates delivery status (validated against the pending request status)'
  /* #swagger.parameters['obj'] = {
        in: 'body', required: true,
        schema: { status: 'en_route | arrived | completed | failed', remarks: 'string' }
  } */
  const userId = req.user?.id ?? req.session?.userId ?? null
  if (!userId) return res.status(401).json({ message: 'Unauthorized. Please log in.' })

  const { id } = req.params
  const action = String(req.body?.status || '')
    .trim()
    .toLowerCase()
  const remarks = String(req.body?.remarks || '').trim() || null
  const rule = DRIVER_ACTIONS[action]

  if (!isValidUUID(id)) return res.status(400).json({ message: 'id must be a valid UUID' })
  if (!rule) {
    return res
      .status(400)
      .json({ message: 'status must be en_route, arrived, completed or failed' })
  }
  if (rule.requiresRemarks && !remarks) {
    return res.status(400).json({ message: 'Please describe what went wrong' })
  }

  try {
    const rows = await Query(
      `SELECT dm.dm_id, dm.dm_status, dm.dm_driverId, dm.dm_vehicleId,
              dm.dm_pendingRequestId, pr.pr_status
         FROM dispatch_monitoring dm
         JOIN pending_request pr ON pr.pr_id = dm.dm_pendingRequestId
        WHERE dm.dm_id = ? LIMIT 1`,
      [id],
    )
    const dispatch = rows?.[0]
    if (!dispatch) return res.status(404).json({ message: 'Dispatch not found' })

    if (dispatch.dm_driverId !== userId) {
      return res.status(403).json({ message: 'This dispatch is not assigned to you' })
    }

    if (!rule.from.includes(dispatch.dm_status)) {
      return res.status(409).json({
        message: `Cannot change delivery from "${dispatch.dm_status}" to "${action}"`,
      })
    }

    const requestStatus = String(dispatch.pr_status || '')
      .trim()
      .toLowerCase()
    if (!rule.requestFrom.includes(requestStatus)) {
      return res.status(409).json({
        message: `The request is now "${requestStatus}", so this delivery can no longer be updated. Contact your dispatcher.`,
      })
    }
    if (
      rule.requestTo &&
      !rule.skipTransitionCheck &&
      !canTransition(requestStatus, rule.requestTo)
    ) {
      return res.status(409).json({
        message: `Request cannot move from "${requestStatus}" to "${rule.requestTo}"`,
      })
    }

    const now = new Date()
    const queries = [
      {
        // CHANGED: only applies if the dispatch is still in the status we read above,
        // and `expectAffected` makes the transaction roll back if it isn't. A double
        // tap (or a retry) can no longer apply the same transition twice and overwrite
        // the performance timestamps. Needs the small Transaction() patch below.
        sql: `UPDATE dispatch_monitoring
                 SET dm_status = ?, ${rule.tsCol} = ?, dm_remarks = COALESCE(?, dm_remarks)
               WHERE dm_id = ? AND dm_status = ?`,
        values: [rule.dmStatus, now, remarks, id, dispatch.dm_status],
        expectAffected: 1,
      },
      driverPerf.onStatusChanged({ dispatchId: id, status: rule.dmStatus, at: now }),
    ]

    if (rule.requestTo) {
      queries.push({
        sql: 'UPDATE pending_request SET pr_status = ? WHERE pr_id = ?',
        values: [rule.requestTo, dispatch.dm_pendingRequestId],
      })
    }
    if (rule.frees) {
      queries.push({
        sql: `UPDATE master_vehicles SET mv_status = 'Available', mv_updated_at = ? WHERE mv_id = ?`,
        values: [now, dispatch.dm_vehicleId],
      })
    }

    await Transaction(queries)

    const payload = {
      dispatchId: id,
      status: action,
      requestStatus: rule.requestTo || requestStatus,
    }
    emitToStaff(req, 'dispatch:status', payload)
    emitToUser(req, userId, 'dispatch:status', payload)

    return res.status(200).json({ success: true, id, status: action, ...payload })
  } catch (error) {
    // NEW: someone (or a double tap) changed this dispatch between our read and write
    if (error.code === 'STATE_CHANGED') {
      return res
        .status(409)
        .json({ message: 'This delivery was just updated. Please refresh and try again.' })
    }
    console.error('Update Dispatch Status Exception:', error)
    return res.status(500).json({ message: 'Error updating dispatch status' })
  }
}

module.exports = { getMyDispatches, updateDispatchStatus }