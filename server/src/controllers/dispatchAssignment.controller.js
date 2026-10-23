// server/src/controllers/dispatchAssignment.controller.js
const { v4: uuidv4 } = require('uuid')
const { REQUEST_STATUS } = require('../database/constants/requestStatus')
const { Query, Transaction } = require('../database/utilities/queries.util')
const driverPerf = require('../services/driverPerformance.service') // NEW
const { emitToUser, emitToStaff } = require('../utilities/realtime.util') // NEW

const DRIVER_ROLE_NAME = 'driver' // compared case-insensitively against master_role.mr_role_name

// Dispatch statuses that mean "still occupying the vehicle/driver"
const ACTIVE_DISPATCH_STATUSES = ['assigned', 'en_route', 'arrived']
// Statuses where the assignment can still be changed
const REASSIGNABLE_STATUSES = ['assigned', 'cancelled']

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isValidUUID = (value) => typeof value === 'string' && UUID_REGEX.test(value)

const placeholders = (arr) => arr.map(() => '?').join(', ')

/**
 * @name assignDriverAndVehicle
 * @description Assign a driver, vehicle and target store to an APPROVED pending
 *              request (pr_status = ready_for_dispatch). The branch of the
 *              logged-in user is recorded as the branch that created the dispatch.
 *              Re-calling on a request still 'assigned' (or 'cancelled') replaces
 *              the driver/vehicle/store; the creating branch is kept.
 */
const assignDriverAndVehicle = async (req, res) => {
  // #swagger.tags = ['Dispatch']
  // #swagger.description = 'Assign driver, vehicle and target store to an approved pending request'
  /* #swagger.parameters['obj'] = {
        in: 'body',
        required: true,
        description: 'Assignment details. storeId is optional: defaults to the request storeId.',
        schema: { requestId: 'uuid', vehicleId: 'uuid', driverId: 'uuid', storeId: 'uuid', remarks: 'string' }
  } */
  /* #swagger.responses[201] = { description: "Assigned successfully" } */
  /* #swagger.responses[200] = { description: "Reassigned successfully" } */
  /* #swagger.responses[400] = { description: "Validation error" } */
  /* #swagger.responses[404] = { description: "Request, vehicle, driver or store not found" } */
  /* #swagger.responses[409] = { description: "Status or availability conflict" } */

  const userId = req.user?.id ?? req.session?.userId ?? null
  if (!userId) {
    console.table([
      { Action: 'ASSIGN_DISPATCH', Status: 'UNAUTHORIZED', Reason: 'No session or user id found' },
    ])
    return res.status(401).json({ message: 'Unauthorized. Please log in.' })
  }

  const requestId = req.body?.requestId || req.params?.requestId
  const { vehicleId, driverId, storeId, remarks } = req.body || {}

  try {
    // ── 1. Validate input ────────────────────────────────────────────────
    if (!requestId) {
      console.table([{ Action: 'ASSIGN_DISPATCH', Status: 'FAILED', Reason: 'Missing requestId' }])
      return res.status(400).json({ message: 'requestId is required' })
    }
    if (!isValidUUID(requestId)) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          RequestId: requestId,
          Status: 'FAILED',
          Reason: 'Invalid requestId UUID',
        },
      ])
      return res.status(400).json({ message: 'requestId must be a valid UUID' })
    }
    if (!vehicleId) {
      console.table([{ Action: 'ASSIGN_DISPATCH', Status: 'FAILED', Reason: 'Missing vehicleId' }])
      return res.status(400).json({ message: 'vehicleId is required' })
    }
    if (!isValidUUID(vehicleId)) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          VehicleId: vehicleId,
          Status: 'FAILED',
          Reason: 'Invalid vehicleId UUID',
        },
      ])
      return res.status(400).json({ message: 'vehicleId must be a valid UUID' })
    }
    if (!driverId) {
      console.table([{ Action: 'ASSIGN_DISPATCH', Status: 'FAILED', Reason: 'Missing driverId' }])
      return res.status(400).json({ message: 'driverId is required' })
    }
    if (!isValidUUID(driverId)) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          DriverId: driverId,
          Status: 'FAILED',
          Reason: 'Invalid driverId UUID',
        },
      ])
      return res.status(400).json({ message: 'driverId must be a valid UUID' })
    }
    if (storeId && !isValidUUID(storeId)) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          StoreId: storeId,
          Status: 'FAILED',
          Reason: 'Invalid storeId UUID',
        },
      ])
      return res.status(400).json({ message: 'storeId must be a valid UUID' })
    }

    // ── 2. Request must exist AND be approved (ready_for_dispatch) ───────
    const requestRows = await Query(
      `SELECT pr_id, pr_requestId, pr_status, pr_storeId
         FROM pending_request
        WHERE pr_requestId = ? OR pr_id = ?
        LIMIT 1`,
      [requestId, requestId],
    )
    const request = requestRows?.[0]
    if (!request) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          RequestId: requestId,
          Status: 'NOT_FOUND',
          Reason: 'Request does not exist',
        },
      ])
      return res.status(404).json({ message: 'Request not found' })
    }

    const currentStatus = String(request.pr_status || '')
      .trim()
      .toLowerCase()
    if (currentStatus !== REQUEST_STATUS.READY_FOR_DISPATCH) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          RequestId: request.pr_requestId,
          CurrentStatus: currentStatus,
          Status: 'CONFLICT',
          Reason: 'Request not ready for dispatch',
        },
      ])
      return res.status(409).json({
        message: `Only approved requests (ready_for_dispatch) can be assigned. Current status is "${request.pr_status || 'unknown'}".`,
      })
    }

    // ── 3. Target store: explicit selection, else the request's own store ─
    const targetStoreId = storeId || request.pr_storeId
    if (!targetStoreId) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          RequestId: request.pr_requestId,
          Status: 'FAILED',
          Reason: 'No storeId provided or found on request',
        },
      ])
      return res.status(400).json({ message: 'storeId is required (the request has no store set)' })
    }
    const storeRows = await Query(
      'SELECT ms_id FROM master_stores WHERE ms_id = ? AND ms_is_active = 1 LIMIT 1',
      [targetStoreId],
    )
    if (!storeRows?.length) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          TargetStoreId: targetStoreId,
          Status: 'NOT_FOUND',
          Reason: 'Target store not found or inactive',
        },
      ])
      return res.status(404).json({ message: 'Target store not found or inactive' })
    }

    // ── 4. Branch that is creating the dispatch = logged-in user's branch ─
    const creatorRows = await Query(
      'SELECT mu_branch_id FROM master_users WHERE mu_id = ? AND mu_isActive = 1 LIMIT 1',
      [userId],
    )
    const creatorBranchId = creatorRows?.[0]?.mu_branch_id
    if (!creatorBranchId) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          UserId: userId,
          Status: 'FORBIDDEN',
          Reason: 'User not linked to active branch',
        },
      ])
      return res.status(403).json({ message: 'Your account is not linked to an active branch' })
    }

    // ── 5. Existing dispatch record for this request? ────────────────────
    // CHANGED: also select dm_driverId + dm_branchId (needed for the
    // "unassigned" event and for keeping the original branch on the perf row)
    const existingRows = await Query(
      `SELECT dm_id, dm_status, dm_vehicleId, dm_driverId, dm_branchId
         FROM dispatch_monitoring
        WHERE dm_pendingRequestId = ?
        LIMIT 1`,
      [request.pr_id],
    )
    const existing = existingRows?.[0]

    if (existing && !REASSIGNABLE_STATUSES.includes(existing.dm_status)) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          RequestId: request.pr_requestId,
          ExistingStatus: existing.dm_status,
          Status: 'CONFLICT',
          Reason: 'Dispatch status cannot be reassigned',
        },
      ])
      return res.status(409).json({
        message: `This request's dispatch is already "${existing.dm_status}" and can no longer be reassigned.`,
      })
    }

    // ── 6. Vehicle exists and is Available (or is already ours) ──────────
    const vehicleRows = await Query(
      'SELECT mv_id, mv_status FROM master_vehicles WHERE mv_id = ? LIMIT 1',
      [vehicleId],
    )
    const vehicle = vehicleRows?.[0]
    if (!vehicle) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          VehicleId: vehicleId,
          Status: 'NOT_FOUND',
          Reason: 'Vehicle not found',
        },
      ])
      return res.status(404).json({ message: 'Vehicle not found' })
    }
    const keepingSameVehicle =
      existing && existing.dm_vehicleId === vehicleId && vehicle.mv_status === 'Assigned'
    if (vehicle.mv_status !== 'Available' && !keepingSameVehicle) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          VehicleId: vehicleId,
          VehicleStatus: vehicle.mv_status,
          Status: 'CONFLICT',
          Reason: 'Vehicle not available',
        },
      ])
      return res
        .status(409)
        .json({ message: `Vehicle is not available (current status: "${vehicle.mv_status}")` })
    }

    // ── 7. Driver exists, is active, and has the Driver role ─────────────
    const driverRows = await Query(
      `SELECT u.mu_id
         FROM master_users u
         JOIN master_role r ON r.mr_id = u.mu_role_id
        WHERE u.mu_id = ?
          AND u.mu_isActive = 1
          AND r.mr_is_active = 1
          AND LOWER(r.mr_role_name) = ?
        LIMIT 1`,
      [driverId, DRIVER_ROLE_NAME],
    )
    if (!driverRows?.length) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          DriverId: driverId,
          Status: 'NOT_FOUND',
          Reason: 'Driver not found, inactive, or missing role',
        },
      ])
      return res
        .status(404)
        .json({ message: 'Driver not found, inactive, or user does not have the Driver role' })
    }

    // ── 8. Vehicle / driver not already on another active dispatch ───────
    const activeIn = placeholders(ACTIVE_DISPATCH_STATUSES)

    const vehicleBusy = await Query(
      `SELECT dm_id FROM dispatch_monitoring
        WHERE dm_vehicleId = ? AND dm_status IN (${activeIn}) AND dm_pendingRequestId != ?
        LIMIT 1`,
      [vehicleId, ...ACTIVE_DISPATCH_STATUSES, request.pr_id],
    )
    if (vehicleBusy?.length) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          VehicleId: vehicleId,
          Status: 'CONFLICT',
          Reason: 'Vehicle assigned to another active dispatch',
        },
      ])
      return res
        .status(409)
        .json({ message: 'Vehicle is already assigned to another active dispatch' })
    }

    const driverBusy = await Query(
      `SELECT dm_id FROM dispatch_monitoring
        WHERE dm_driverId = ? AND dm_status IN (${activeIn}) AND dm_pendingRequestId != ?
        LIMIT 1`,
      [driverId, ...ACTIVE_DISPATCH_STATUSES, request.pr_id],
    )
    if (driverBusy?.length) {
      console.table([
        {
          Action: 'ASSIGN_DISPATCH',
          DriverId: driverId,
          Status: 'CONFLICT',
          Reason: 'Driver assigned to another active dispatch',
        },
      ])
      return res
        .status(409)
        .json({ message: 'Driver is already assigned to another active dispatch' })
    }

    // ── 9. Write dispatch record + sync vehicle status, atomically ───────
    const now = new Date()
    const queries = []

    // NEW: one id used by the dispatch row, the performance row and the events
    const dispatchId = existing ? existing.dm_id : uuidv4()

    if (existing) {
      queries.push({
        // CHANGED: also clear departed/arrived/completed so a reassigned
        // dispatch doesn't keep stale timestamps from the previous attempt
        sql: `UPDATE dispatch_monitoring SET
              dm_vehicleId = ?, dm_driverId = ?, dm_targetStoreId = ?,
              dm_status = 'assigned', dm_assignedBy = ?, dm_assignedAt = ?,
              dm_departedAt = NULL, dm_arrivedAt = NULL,
              dm_completedAt = NULL, dm_cancelledAt = NULL,
              dm_remarks = ?
              WHERE dm_id = ?`,
        values: [vehicleId, driverId, targetStoreId, userId, now, remarks || null, existing.dm_id],
      })

      // Free the previous vehicle if it was swapped out
      if (existing.dm_vehicleId !== vehicleId) {
        queries.push({
          sql: `UPDATE master_vehicles SET mv_status = 'Available', mv_updated_at = ?
                 WHERE mv_id = ? AND mv_status = 'Assigned'`,
          values: [now, existing.dm_vehicleId],
        })
      }
    } else {
      queries.push({
        sql: `INSERT INTO dispatch_monitoring
              (dm_id, dm_pendingRequestId, dm_vehicleId, dm_driverId, dm_targetStoreId,
               dm_branchId, dm_status, dm_assignedBy, dm_assignedAt, dm_remarks)
              VALUES (?, ?, ?, ?, ?, ?, 'assigned', ?, ?, ?)`,
        values: [
          dispatchId, // CHANGED: was uuidv4()
          request.pr_id,
          vehicleId,
          driverId,
          targetStoreId,
          creatorBranchId,
          userId,
          now,
          remarks || null,
        ],
      })
    }

    // Mark the (new) vehicle as Assigned
    queries.push({
      sql: `UPDATE master_vehicles SET mv_status = 'Assigned', mv_updated_at = ? WHERE mv_id = ?`,
      values: [now, vehicleId],
    })

    // NEW: create (or reset, on reassign) the driver_performance row in the
    // SAME transaction. Without this, the performance table stays empty and
    // every driver's stats read zero.
    queries.push(
      driverPerf.onAssigned({
        dispatchId,
        driverId,
        vehicleId,
        branchId: existing?.dm_branchId ?? creatorBranchId,
        at: now,
      }),
    )

    await Transaction(queries)

    console.table([
      {
        Action: existing ? 'DISPATCH_REASSIGN_SUCCESS' : 'DISPATCH_ASSIGN_SUCCESS',
        RequestId: request.pr_requestId,
        VehicleId: vehicleId,
        DriverId: driverId,
        StoreId: targetStoreId,
        AssignedBy: userId,
      },
    ])

    // NEW: realtime. Emit helpers never throw, so a socket problem can't
    // turn a committed assignment into a 500.
    const eventPayload = { dispatchId, requestId: request.pr_requestId }
    emitToUser(req, driverId, 'dispatch:assigned', eventPayload)
    if (existing && existing.dm_driverId !== driverId) {
      emitToUser(req, existing.dm_driverId, 'dispatch:unassigned', eventPayload)
    }
    emitToStaff(req, 'dispatch:status', { dispatchId, status: 'assigned' })

    return res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? 'Reassigned successfully' : 'Assigned successfully',
      requestId: request.pr_requestId,
      vehicleId,
      driverId,
      targetStoreId,
      ...(existing ? {} : { createdByBranchId: creatorBranchId }),
      status: 'assigned',
    })
  } catch (error) {
    console.error('Assign Driver/Vehicle Exception:', error)
    console.table([{ Action: 'ASSIGN_DISPATCH', Status: 'EXCEPTION', Error: error.message }])
    // Unique indexes on active vehicle/driver caught a race between two assigners
    if (error.code === 'ER_DUP_ENTRY' || error.code === '23505' || error.errno === 1062) {
      return res
        .status(409)
        .json({ message: 'Vehicle or driver was just assigned to another active dispatch' })
    }
    return res.status(500).json({ message: 'Error assigning driver and vehicle' })
  }
}

/**
 * @name getDispatchMonitoring
 * @description List dispatch records with vehicle, driver, target store and
 *              creating branch resolved to names.
 *              Optional filters: ?status= ?driverId= ?branchId= ?storeId=
 */
const getDispatchMonitoring = async (req, res) => {
  // #swagger.tags = ['Dispatch']
  // #swagger.description = 'List dispatch monitoring records'

  const { status, driverId, branchId, storeId } = req.query
  console.debug('[DispatchController] Fetching dispatch monitoring list with filters:', {
    status,
    driverId,
    branchId,
    storeId,
  })

  try {
    const where = []
    const bindings = []

    if (status) {
      where.push('dm.dm_status = ?')
      bindings.push(String(status).toLowerCase())
    }
    for (const [label, value, col] of [
      ['driverId', driverId, 'dm.dm_driverId'],
      ['branchId', branchId, 'dm.dm_branchId'],
      ['storeId', storeId, 'dm.dm_targetStoreId'],
    ]) {
      if (!value) continue
      if (!isValidUUID(value)) {
        console.table([
          {
            Action: 'GET_MONITORING',
            Filter: label,
            Value: value,
            Status: 'FAILED',
            Reason: 'Invalid UUID',
          },
        ])
        return res.status(400).json({ message: `${label} must be a valid UUID` })
      }
      where.push(`${col} = ?`)
      bindings.push(value)
    }

    const rows = await Query(
      `SELECT dm.dm_id               AS id,
              dm.dm_pendingRequestId AS pendingRequestId,
              pr.pr_requestId        AS requestId,
              pr.pr_ticketNumber     AS ticketNumber,
              pr.pr_status           AS requestStatus,
              dm.dm_status           AS status,
              dm.dm_vehicleId        AS vehicleId,
              v.mv_plate_number      AS vehiclePlateNumber,
              v.mv_status            AS vehicleStatus,
              dm.dm_driverId         AS driverId,
              CONCAT(d.mu_first_name, ' ', d.mu_last_name) AS driverName,
              dm.dm_targetStoreId    AS targetStoreId,
              s.ms_store_name        AS targetStoreName,
              dm.dm_branchId         AS createdByBranchId,
              b.mb_branch_name       AS createdByBranchName,
              pr.pr_branchId         AS requestBranchId,
              dm.dm_assignedBy       AS assignedBy,
              dm.dm_assignedAt       AS assignedAt,
              dm.dm_departedAt       AS departedAt,
              dm.dm_arrivedAt        AS arrivedAt,
              dm.dm_completedAt      AS completedAt,
              dm.dm_cancelledAt      AS cancelledAt,
              dm.dm_remarks          AS remarks
         FROM dispatch_monitoring dm
         JOIN pending_request pr ON pr.pr_id = dm.dm_pendingRequestId
         JOIN master_vehicles v  ON v.mv_id  = dm.dm_vehicleId
         JOIN master_users d     ON d.mu_id  = dm.dm_driverId
         JOIN master_stores s    ON s.ms_id  = dm.dm_targetStoreId
         JOIN master_branch b    ON b.mb_id  = dm.dm_branchId
         ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY dm.dm_assignedAt DESC`,
      bindings,
    )

    console.debug(
      `[DispatchController] Successfully fetched ${rows?.length || 0} dispatch monitoring records`,
    )
    return res.status(200).json(rows || [])
  } catch (error) {
    console.error('Get Dispatch Monitoring Exception:', error)
    console.table([{ Action: 'GET_MONITORING', Status: 'EXCEPTION', Error: error.message }])
    return res.status(500).json({ message: 'Error retrieving dispatch monitoring' })
  }
}

/**
 * @name getDispatchDrivers
 * @description Active users with the Driver role, for the assignment picker.
 *              Returns only safe fields (never the password hash).
 *              `isBusy` = already on another active dispatch. Pass ?requestId=
 *              so the driver already assigned to THAT request is not marked busy.
 */
const getDispatchDrivers = async (req, res) => {
  // #swagger.tags = ['Dispatch']
  // #swagger.description = 'List assignable drivers'

  const { requestId } = req.query
  console.debug(
    '[DispatchController] Fetching assignable drivers',
    requestId ? `for request: ${requestId}` : '',
  )

  try {
    if (requestId && !isValidUUID(requestId)) {
      console.table([
        { Action: 'GET_DRIVERS', RequestId: requestId, Status: 'FAILED', Reason: 'Invalid UUID' },
      ])
      return res.status(400).json({ message: 'requestId must be a valid UUID' })
    }

    const activeIn = placeholders(ACTIVE_DISPATCH_STATUSES)
    const bindings = [...ACTIVE_DISPATCH_STATUSES]
    let excludeCurrent = ''
    if (requestId) {
      excludeCurrent =
        'AND dm.dm_pendingRequestId != (SELECT pr_id FROM pending_request WHERE pr_requestId = ? LIMIT 1)'
      bindings.push(requestId)
    }
    bindings.push(DRIVER_ROLE_NAME)

    const rows = await Query(
      `SELECT u.mu_id        AS id,
              CONCAT(u.mu_first_name, ' ', u.mu_last_name) AS name,
              u.mu_branch_id AS branchId,
              EXISTS (
                SELECT 1 FROM dispatch_monitoring dm
                 WHERE dm.dm_driverId = u.mu_id
                   AND dm.dm_status IN (${activeIn})
                   ${excludeCurrent}
              ) AS isBusy
         FROM master_users u
         JOIN master_role r ON r.mr_id = u.mu_role_id
        WHERE u.mu_isActive = 1
          AND r.mr_is_active = 1
          AND LOWER(r.mr_role_name) = ?
        ORDER BY u.mu_first_name, u.mu_last_name`,
      bindings,
    )

    console.debug(`[DispatchController] Fetched ${rows?.length || 0} drivers successfully`)
    return res.status(200).json((rows || []).map((r) => ({ ...r, isBusy: Boolean(r.isBusy) })))
  } catch (error) {
    console.error('Get Dispatch Drivers Exception:', error)
    console.table([{ Action: 'GET_DRIVERS', Status: 'EXCEPTION', Error: error.message }])
    return res.status(500).json({ message: 'Error retrieving drivers' })
  }
}

/**
 * @name getDispatchVehicles
 * @description Vehicles that can be assigned: status 'Available', plus the
 *              vehicle currently assigned to ?requestId= (so reassigning keeps it selectable).
 */
const getDispatchVehicles = async (req, res) => {
  // #swagger.tags = ['Dispatch']
  // #swagger.description = 'List assignable vehicles'

  const { requestId } = req.query
  console.debug(
    '[DispatchController] Fetching assignable vehicles',
    requestId ? `for request: ${requestId}` : '',
  )

  try {
    if (requestId && !isValidUUID(requestId)) {
      console.table([
        { Action: 'GET_VEHICLES', RequestId: requestId, Status: 'FAILED', Reason: 'Invalid UUID' },
      ])
      return res.status(400).json({ message: 'requestId must be a valid UUID' })
    }

    const bindings = []
    let includeCurrent = ''
    if (requestId) {
      includeCurrent = `OR v.mv_id IN (
          SELECT dm.dm_vehicleId FROM dispatch_monitoring dm
            JOIN pending_request pr ON pr.pr_id = dm.dm_pendingRequestId
           WHERE pr.pr_requestId = ?)`
      bindings.push(requestId)
    }

    const rows = await Query(
      `SELECT v.mv_id          AS id,
              v.mv_plate_number AS plateNumber,
              v.mv_brand        AS brand,
              v.mv_model        AS model,
              v.mv_capacity     AS capacity,
              v.mv_status       AS status,
              v.mv_vehicleTypeId AS vehicleTypeId
         FROM master_vehicles v
        WHERE v.mv_status = 'Available' ${includeCurrent}
        ORDER BY v.mv_plate_number`,
      bindings,
    )

    console.debug(`[DispatchController] Fetched ${rows?.length || 0} vehicles successfully`)
    return res.status(200).json(rows || [])
  } catch (error) {
    console.error('Get Dispatch Vehicles Exception:', error)
    console.table([{ Action: 'GET_VEHICLES', Status: 'EXCEPTION', Error: error.message }])
    return res.status(500).json({ message: 'Error retrieving vehicles' })
  }
}

module.exports = {
  assignDriverAndVehicle,
  getDispatchMonitoring,
  getDispatchDrivers,
  getDispatchVehicles,
}
