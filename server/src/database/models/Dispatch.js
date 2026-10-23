/**
 * ⚠️ AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 */

/**
 * @typedef {Object} MonitoringCols
 * @property {'dm_id'} id
 * @property {'dm_pendingRequestId'} pendingRequestId
 * @property {'dm_vehicleId'} vehicleId
 * @property {'dm_driverId'} driverId
 * @property {'dm_targetStoreId'} targetStoreId
 * @property {'dm_branchId'} branchId
 * @property {'dm_status'} status
 * @property {'dm_assignedBy'} assignedBy
 * @property {'dm_assignedAt'} assignedAt
 * @property {'dm_departedAt'} departedAt
 * @property {'dm_arrivedAt'} arrivedAt
 * @property {'dm_completedAt'} completedAt
 * @property {'dm_cancelledAt'} cancelledAt
 * @property {'dm_remarks'} remarks
 * @property {'dm_createdAt'} createdAt
 * @property {'dm_updatedAt'} updatedAt
 */

const Dispatch = {
  Monitoring: {
    table: 'dispatch_monitoring',
    pk: 'dm_id',
    prefix: 'dm',
    /** @type {MonitoringCols} */
    cols: {
      id: 'dm_id',
      pendingRequestId: 'dm_pendingRequestId',
      vehicleId: 'dm_vehicleId',
      driverId: 'dm_driverId',
      targetStoreId: 'dm_targetStoreId',
      branchId: 'dm_branchId',
      status: 'dm_status',
      assignedBy: 'dm_assignedBy',
      assignedAt: 'dm_assignedAt',
      departedAt: 'dm_departedAt',
      arrivedAt: 'dm_arrivedAt',
      completedAt: 'dm_completedAt',
      cancelledAt: 'dm_cancelledAt',
      remarks: 'dm_remarks',
      createdAt: 'dm_createdAt',
      updatedAt: 'dm_updatedAt',
    },
    select: ['dm_id', 'dm_pendingRequestId', 'dm_vehicleId', 'dm_driverId', 'dm_targetStoreId', 'dm_branchId', 'dm_status', 'dm_assignedBy', 'dm_assignedAt', 'dm_departedAt', 'dm_arrivedAt', 'dm_completedAt', 'dm_cancelledAt', 'dm_remarks', 'dm_createdAt', 'dm_updatedAt'],
    insert: ['dm_id', 'dm_pendingRequestId', 'dm_vehicleId', 'dm_driverId', 'dm_targetStoreId', 'dm_branchId', 'dm_status', 'dm_assignedBy', 'dm_remarks'],
  },
};

exports.Dispatch = Dispatch;