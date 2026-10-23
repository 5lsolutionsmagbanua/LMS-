/**
 * ⚠️ AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 */

/**
 * @typedef {Object} PerformanceCols
 * @property {'dp_id'} id
 * @property {'dp_dispatchId'} dispatchId
 * @property {'dp_driverId'} driverId
 * @property {'dp_vehicleId'} vehicleId
 * @property {'dp_branchId'} branchId
 * @property {'dp_assignedAt'} assignedAt
 * @property {'dp_departedAt'} departedAt
 * @property {'dp_arrivedAt'} arrivedAt
 * @property {'dp_completedAt'} completedAt
 * @property {'dp_cancelledAt'} cancelledAt
 * @property {'dp_responseSeconds'} responseSeconds
 * @property {'dp_transitSeconds'} transitSeconds
 * @property {'dp_unloadSeconds'} unloadSeconds
 * @property {'dp_totalSeconds'} totalSeconds
 * @property {'dp_finalStatus'} finalStatus
 * @property {'dp_createdAt'} createdAt
 * @property {'dp_updatedAt'} updatedAt
 */

const Driver = {
  Performance: {
    table: 'driver_performance',
    pk: 'dp_id',
    prefix: 'dp',
    /** @type {PerformanceCols} */
    cols: {
      id: 'dp_id',
      dispatchId: 'dp_dispatchId',
      driverId: 'dp_driverId',
      vehicleId: 'dp_vehicleId',
      branchId: 'dp_branchId',
      assignedAt: 'dp_assignedAt',
      departedAt: 'dp_departedAt',
      arrivedAt: 'dp_arrivedAt',
      completedAt: 'dp_completedAt',
      cancelledAt: 'dp_cancelledAt',
      responseSeconds: 'dp_responseSeconds',
      transitSeconds: 'dp_transitSeconds',
      unloadSeconds: 'dp_unloadSeconds',
      totalSeconds: 'dp_totalSeconds',
      finalStatus: 'dp_finalStatus',
      createdAt: 'dp_createdAt',
      updatedAt: 'dp_updatedAt',
    },
    select: ['dp_id', 'dp_dispatchId', 'dp_driverId', 'dp_vehicleId', 'dp_branchId', 'dp_assignedAt', 'dp_departedAt', 'dp_arrivedAt', 'dp_completedAt', 'dp_cancelledAt', 'dp_responseSeconds', 'dp_transitSeconds', 'dp_unloadSeconds', 'dp_totalSeconds', 'dp_finalStatus', 'dp_createdAt', 'dp_updatedAt'],
    insert: ['dp_id', 'dp_dispatchId', 'dp_driverId', 'dp_vehicleId', 'dp_branchId', 'dp_responseSeconds', 'dp_transitSeconds', 'dp_unloadSeconds', 'dp_totalSeconds', 'dp_finalStatus'],
  },
};

exports.Driver = Driver;