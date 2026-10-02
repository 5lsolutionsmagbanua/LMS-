const { REQUEST_STATUS } = require('../database/constants/requestStatus')
const { Query, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Pending } = require('../database/models/Pending')
const SQL = new SQLQueryBuilder()

/**
 * @name approvePendingRequest
 * @description Human-triggered approval of a pending request from the dashboard UI.
 */
const approvePendingRequest = async (req, res) => {
  // #swagger.tags = ['Request']
  // #swagger.description = 'Approve a pending request from the dashboard'
  /* #swagger.parameters['obj'] = {
       in: 'body',
       required: true,
       description: 'Request to approve',
       schema: { requestId: 'any' }
  } */

  const userId = req.user?.id ?? req.session?.userId ?? null

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' })
  }

  // Support both request body or route parameters
  const requestId = req.body?.requestId || req.params?.requestId

  if (!requestId) {
    return res.status(400).json({ message: 'Missing requestId' })
  }

  try {
    // 1. Query the request by requestId
    const requestQuery = SQL.model(Pending.Request)
      .select()
      .where(Pending.Request.cols.requestId, requestId)
      .build()

    const requestRows = await Query(requestQuery.sql, requestQuery.bindings)
    let request = requestRows?.[0]

    if (!request) {
      // Fallback: try checking if they passed the primary key `pk` instead
      const fallbackQuery = SQL.model(Pending.Request).select().where(Pending.pk, requestId).build()
      const fallbackRows = await Query(fallbackQuery.sql, fallbackQuery.bindings)
      request = fallbackRows?.[0]
    }

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    // Safely extract status checking multiple possible key formats
    const currentStatus =
      request[Pending.Request.cols.status] ||
      request.status ||
      request.pr_status ||
      request.requestStatus

    // 2. Process approval ONLY if the status is pending
    const isPending =
      currentStatus === REQUEST_STATUS.PENDING || currentStatus?.toLowerCase() === 'pending'

    if (!isPending) {
      return res.status(400).json({
        message: `Only requests with 'Pending' status can be approved. Current status is "${currentStatus || 'unknown'}".`,
      })
    }

    // 3. --- INLINE TRANSITION CHECK ---
    const normalizedCurrent = String(currentStatus).trim().toLowerCase()
    const targetStatus = REQUEST_STATUS.READY_FOR_DISPATCH // 'ready_for_dispatch'

    const allowedMap = {
      pending: ['pending', 'confirmed', 'ready_for_dispatch', 'failed', 'cancelled'],
      confirmed: ['ready_for_dispatch', 'failed', 'cancelled'],
      ready_for_dispatch: ['dispatched', 'failed', 'cancelled'],
    }

    const allowedList = allowedMap[normalizedCurrent] || []
    const isAllowed = allowedList.includes(targetStatus)

    console.log('--- INLINE TRANSITION CHECK ---')
    console.log('Current:', normalizedCurrent)
    console.log('Target:', targetStatus)
    console.log('Allowed List:', allowedList)
    console.log('Is Allowed?', isAllowed)

    if (!isAllowed) {
      return res.status(409).json({
        message: `Cannot approve request with invalid status transition from "${currentStatus}"`,
      })
    }

    // 4. Update the request status to READY_FOR_DISPATCH using requestId
    const updateQuery = SQL.model(Pending.Request)
      .where(Pending.Request.cols.requestId, requestId)
      .update({
        [Pending.Request.cols.status]: REQUEST_STATUS.READY_FOR_DISPATCH,
        ...(Pending.Request.cols.approvedBy ? { [Pending.Request.cols.approvedBy]: userId } : {}),
        ...(Pending.Request.cols.approvedAt
          ? { [Pending.Request.cols.approvedAt]: new Date() }
          : {}),
      })
      .build()

    await Query(updateQuery.sql, updateQuery.bindings)

    return res.status(200).json({
      message: 'Request approved successfully',
      requestId,
      status: REQUEST_STATUS.READY_FOR_DISPATCH,
    })
  } catch (error) {
    console.error('Approve Request Exception:', error)
    return res.status(500).json({ message: 'Error approving request', error: error.message })
  }
}

/**
 * @name dispatchPendingRequest
 * @description Evaluate and dispatch a pending request
 */
const dispatchPendingRequest = async (req, res) => {
  // #swagger.tags = ['Request']
  // #swagger.description = 'Evaluate and dispatch a request'
  /* #swagger.parameters['obj'] = {
       in: 'body',
       required: true,
       description: 'Request to dispatch',
       schema: { requestId: 'any' }
  } */

  const userId = req.user?.id ?? req.session?.userId ?? null

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' })
  }

  const { requestId } = req.body

  if (!requestId) {
    return res.status(400).json({ message: 'Missing requestId' })
  }

  try {
    const { evaluateForDispatch } = require('../services/dispatch.service')
    await evaluateForDispatch(requestId)

    return res.status(200).json({ message: 'Dispatch evaluated', requestId })
  } catch (error) {
    console.error('Dispatch Request Exception:', error)
    return res.status(500).json({ message: 'Error dispatching request', error: error.message })
  }
}

module.exports = {
  approvePendingRequest,
  dispatchPendingRequest,
}
