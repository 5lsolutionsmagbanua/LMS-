/**
 * ⚠️ AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 */

/**
 * @typedef {Object} RequestCols
 * @property {'pr_id'} id
 * @property {'pr_requestId'} requestId
 * @property {'pr_ticketNumber'} ticketNumber
 * @property {'pr_branchId'} branchId
 * @property {'pr_storeId'} storeId
 * @property {'pr_requestType'} requestType
 * @property {'pr_status'} status
 * @property {'pr_createdDate'} createdDate
 * @property {'pr_createdBy'} createdBy
 * @property {'pr_notes'} notes
 * @property {'pr_createdAt'} createdAt
 * @property {'pr_updatedAt'} updatedAt
 */

/**
 * @typedef {Object} RequestItemCols
 * @property {'pri_id'} id
 * @property {'pri_pendingRequestId'} pendingRequestId
 * @property {'pri_stockId'} stockId
 * @property {'pri_isSerialized'} isSerialized
 * @property {'pri_stockQty'} stockQty
 * @property {'pri_assetTag'} assetTag
 * @property {'pri_serialNumber'} serialNumber
 * @property {'pri_createdAt'} createdAt
 * @property {'pri_updatedAt'} updatedAt
 */

const Pending = {
  Request: {
    table: 'pending_request',
    pk: 'pr_id',
    prefix: 'pr',
    /** @type {RequestCols} */
    cols: {
      id: 'pr_id',
      requestId: 'pr_requestId',
      ticketNumber: 'pr_ticketNumber',
      branchId: 'pr_branchId',
      storeId: 'pr_storeId',
      requestType: 'pr_requestType',
      status: 'pr_status',
      createdDate: 'pr_createdDate',
      createdBy: 'pr_createdBy',
      notes: 'pr_notes',
      createdAt: 'pr_createdAt',
      updatedAt: 'pr_updatedAt',
    },
    select: ['pr_id', 'pr_requestId', 'pr_ticketNumber', 'pr_branchId', 'pr_storeId', 'pr_requestType', 'pr_status', 'pr_createdDate', 'pr_createdBy', 'pr_notes', 'pr_createdAt', 'pr_updatedAt'],
    insert: ['pr_id', 'pr_requestId', 'pr_ticketNumber', 'pr_branchId', 'pr_storeId', 'pr_requestType', 'pr_status', 'pr_createdBy', 'pr_notes'],
  },
  RequestItem: {
    table: 'pending_request_item',
    pk: 'pri_id',
    prefix: 'pri',
    /** @type {RequestItemCols} */
    cols: {
      id: 'pri_id',
      pendingRequestId: 'pri_pendingRequestId',
      stockId: 'pri_stockId',
      isSerialized: 'pri_isSerialized',
      stockQty: 'pri_stockQty',
      assetTag: 'pri_assetTag',
      serialNumber: 'pri_serialNumber',
      createdAt: 'pri_createdAt',
      updatedAt: 'pri_updatedAt',
    },
    select: ['pri_id', 'pri_pendingRequestId', 'pri_stockId', 'pri_isSerialized', 'pri_stockQty', 'pri_assetTag', 'pri_serialNumber', 'pri_createdAt', 'pri_updatedAt'],
    insert: ['pri_id', 'pri_pendingRequestId', 'pri_stockId', 'pri_isSerialized', 'pri_stockQty', 'pri_assetTag', 'pri_serialNumber'],
  },
};

exports.Pending = Pending;