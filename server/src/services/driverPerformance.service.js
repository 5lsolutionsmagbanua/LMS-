// server/src/services/driverPerformance.service.js
// Builds { sql, values } objects meant to be pushed into the SAME Transaction([...])
// array as the dispatch_monitoring write, so both tables commit or roll back together.
const { v4: uuidv4 } = require('uuid')

/** Call when a dispatch is assigned OR reassigned (resets the clock). */
const onAssigned = ({ dispatchId, driverId, vehicleId, branchId, at }) => ({
  sql: `INSERT INTO driver_performance
          (dp_id, dp_dispatchId, dp_driverId, dp_vehicleId, dp_branchId,
           dp_assignedAt, dp_finalStatus, dp_createdAt, dp_updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, 'assigned', ?, ?)
        ON DUPLICATE KEY UPDATE
          dp_driverId = VALUES(dp_driverId),
          dp_vehicleId = VALUES(dp_vehicleId),
          dp_assignedAt = VALUES(dp_assignedAt),
          dp_departedAt = NULL, dp_arrivedAt = NULL,
          dp_completedAt = NULL, dp_cancelledAt = NULL,
          dp_responseSeconds = NULL, dp_transitSeconds = NULL,
          dp_unloadSeconds = NULL, dp_totalSeconds = NULL,
          dp_finalStatus = 'assigned',
          dp_updatedAt = VALUES(dp_updatedAt)`,
  values: [uuidv4(), dispatchId, driverId, vehicleId, branchId, at, at, at],
})

/** Call on every driver status change (en_route | arrived | completed | cancelled). */
const onStatusChanged = ({ dispatchId, status, at }) => {
  const sets = {
    en_route: {
      sql: `dp_departedAt = ?, dp_responseSeconds = TIMESTAMPDIFF(SECOND, dp_assignedAt, ?)`,
      values: [at, at],
    },
    arrived: {
      sql: `dp_arrivedAt = ?, dp_transitSeconds = TIMESTAMPDIFF(SECOND, dp_departedAt, ?)`,
      values: [at, at],
    },
    completed: {
      sql: `dp_completedAt = ?,
            dp_unloadSeconds = TIMESTAMPDIFF(SECOND, dp_arrivedAt, ?),
            dp_totalSeconds = TIMESTAMPDIFF(SECOND, dp_assignedAt, ?)`,
      values: [at, at, at],
    },
    cancelled: { sql: `dp_cancelledAt = ?`, values: [at] },
  }[status]

  if (!sets) throw new Error(`driverPerformance: unsupported status "${status}"`)

  return {
    sql: `UPDATE driver_performance
             SET ${sets.sql}, dp_finalStatus = ?, dp_updatedAt = ?
           WHERE dp_dispatchId = ?`,
    values: [...sets.values, status, at, dispatchId],
  }
}

module.exports = { onAssigned, onStatusChanged }
