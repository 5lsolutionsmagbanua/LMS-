// client/src/constants/pendingRequest.js

/**
 * Every status a request can be in. These match the server transition map
 * and the badge styles on the Stock Requests page:
 * pending -> confirmed -> ready_for_dispatch -> dispatched (or failed / cancelled).
 * Use this for display and filtering.
 */
export const REQUEST_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'ready_for_dispatch', label: 'Ready for dispatch' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

/**
 * Statuses a user may pick in the create / edit forms. Later statuses are
 * reached through the approval and dispatch flow, not by hand-editing.
 */
export const EDITABLE_REQUEST_STATUSES = REQUEST_STATUSES.filter((s) =>
  ['pending', 'confirmed'].includes(s.value),
)

/**
 * ⚠️ ASSUMPTION: placeholders — swap in your real request types.
 */
export const REQUEST_TYPES = [
  { value: 'new-deployment', label: 'New deployment' },
  { value: 'replacement', label: 'Replacement' },
  { value: 'return', label: 'Return' },
  { value: 'repair', label: 'Repair' },
  { value: 'decommission', label: 'Decommission' },
]

export const DEFAULT_STATUS = 'pending'

export const emptyItem = () => ({
  _key: crypto.randomUUID(),
  stockId: '',
  isSerialized: false,
  stockQty: 1,
  assetTag: '',
  serialNumber: '',
})