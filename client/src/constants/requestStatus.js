const REQUEST_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  READY_FOR_DISPATCH: 'ready_for_dispatch',
  DISPATCHED: 'dispatched',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
}

// Explicitly use string literals for keys to guarantee a match
const ALLOWED_TRANSITIONS = {
  pending: [
    'pending',
    'confirmed',
    'ready_for_dispatch', // 👈 Explicitly allowed
    'failed',
    'cancelled',
  ],
  confirmed: ['ready_for_dispatch', 'failed', 'cancelled'],
  ready_for_dispatch: ['dispatched', 'failed', 'cancelled'],
  dispatched: [],
  failed: ['pending'],
  cancelled: [],
}

/**
 * Validates if a status transition is legally permitted
 */
const canTransition = (currentStatus, nextStatus) => {
  if (!currentStatus || !nextStatus) return false

  const normalizedCurrent = String(currentStatus).trim().toLowerCase()
  const normalizedNext = String(nextStatus).trim().toLowerCase()

  const allowed = ALLOWED_TRANSITIONS[normalizedCurrent]

  console.log(`[canTransition Debug] Current: "${normalizedCurrent}", Allowed list:`, allowed)

  return Array.isArray(allowed) && allowed.includes(normalizedNext)
}

module.exports = {
  REQUEST_STATUS,
  ALLOWED_TRANSITIONS,
  canTransition,
}
