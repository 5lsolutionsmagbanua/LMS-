// services/dispatch.service.js
const { REQUEST_STATUS, canTransition } = require('../database/constants/requestStatus')
const { Query, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Pending } = require('../database/models/Pending')
// TODO: these two are called below but not defined or imported anywhere in
// this file — add the correct imports once you confirm where they live
// (e.g. '../services/stock.service' and '../services/dispatchTrigger.service')
// const { verifyStockStillAvailable } = require('../services/stock.service')
// const { triggerDispatch } = require('../services/dispatchTrigger.service')
const SQL = new SQLQueryBuilder()

const evaluateForDispatch = async (requestId) => {
  const requestQuery = SQL.model(Pending.Request)
    .select()
    .where(Pending.Request.cols.requestId, requestId)
    .build()

  const requestRows = await Query(requestQuery.sql, requestQuery.bindings)
  const request = requestRows?.[0]

  const currentStatus = request?.[Pending.Request.cols.status] ?? request?.status

  if (!request || currentStatus !== REQUEST_STATUS.CONFIRMED) return

  const internalId = request[Pending.Request.cols.id] ?? request.id

  const itemsQuery = SQL.model(Pending.RequestItem)
    .select()
    .where(Pending.RequestItem.cols.pendingRequestId, internalId)
    .build()

  const items = await Query(itemsQuery.sql, itemsQuery.bindings)

  // Re-validate stock at dispatch time, not just at creation time —
  // it may have moved since the request was first created.
  const stockOk = await verifyStockStillAvailable(items)

  if (!stockOk) {
    const failQuery = SQL.model(Pending.Request)
      .update({ [Pending.Request.cols.status]: REQUEST_STATUS.FAILED })
      .where(Pending.Request.cols.requestId, requestId)
      .build()

    await Query(failQuery.sql, failQuery.bindings)
    // notify ops team here
    return
  }

  if (!canTransition(currentStatus, REQUEST_STATUS.READY_FOR_DISPATCH)) return

  const readyQuery = SQL.model(Pending.Request)
    .update({ [Pending.Request.cols.status]: REQUEST_STATUS.READY_FOR_DISPATCH })
    .where(Pending.Request.cols.requestId, requestId)
    .build()

  await Query(readyQuery.sql, readyQuery.bindings)

  // Fire the actual dispatch trigger — queue message, API call, or
  // driver notification, depending on how your logistics side works.
  await triggerDispatch(request)
}

module.exports = { evaluateForDispatch }
