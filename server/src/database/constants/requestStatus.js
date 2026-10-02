// database/constants/requestStatus.js
const REQUEST_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed', // other system called back and confirmed
  READY_FOR_DISPATCH: 'ready_for_dispatch',
  DISPATCHED: 'dispatched',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
}

// Only these transitions are legal. Anything else is rejected.
const ALLOWED_TRANSITIONS = {
  [REQUEST_STATUS.PENDING]: [REQUEST_STATUS.CONFIRMED, REQUEST_STATUS.CANCELLED],
  [REQUEST_STATUS.CONFIRMED]: [REQUEST_STATUS.READY_FOR_DISPATCH, REQUEST_STATUS.FAILED],
  [REQUEST_STATUS.READY_FOR_DISPATCH]: [REQUEST_STATUS.DISPATCHED, REQUEST_STATUS.FAILED],
  [REQUEST_STATUS.DISPATCHED]: [], // terminal
  [REQUEST_STATUS.FAILED]: [REQUEST_STATUS.PENDING], // allow retry from failed
  [REQUEST_STATUS.CANCELLED]: [],
}

const canTransition = (from, to) => (ALLOWED_TRANSITIONS[from] || []).includes(to)

module.exports = { REQUEST_STATUS, canTransition }
