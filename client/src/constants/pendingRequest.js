/**
 * ⚠️ ASSUMPTION: these mirror what's likely in
 * server/src/database/constants/requestStatus.js, but that file's content
 * wasn't available when this was written. Replace REQUEST_STATUSES with the
 * real values from that file before shipping.
 */
export const REQUEST_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

/**
 * ⚠️ ASSUMPTION: no requestType constants existed anywhere in the provided
 * structure. These are placeholders — swap in your real request types.
 */
export const REQUEST_TYPES = [
  { value: 'new-deployment', label: 'New deployment' },
  { value: 'replacement', label: 'Replacement' },
  { value: 'return', label: 'Return' },
  { value: 'repair', label: 'Repair' },
  { value: 'decommission', label: 'Decommission' },
]

export const DEFAULT_STATUS = REQUEST_STATUSES[0].value

export const emptyItem = () => ({
  _key: crypto.randomUUID(),
  stockId: '',
  isSerialized: false,
  stockQty: 1,
  assetTag: '',
  serialNumber: '',
})
