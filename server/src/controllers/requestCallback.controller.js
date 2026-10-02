// controllers/requestCallback.controller.js
const { REQUEST_STATUS, canTransition } = require('../database/constants/requestStatus')
const { Query, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Pending } = require('../database/models/Pending')
const { evaluateForDispatch } = require('../services/dispatch.service')
const SQL = new SQLQueryBuilder()

// TODO: this route accepts x-signature / x-timestamp headers per the
// generated swagger doc, but no verification of them happens anywhere in
// this file. Confirm whether that's enforced by middleware on
// request-callback.routes.js — if not, this endpoint is unauthenticated
// and anyone who can reach it can flip any requestId's status.

const handleRequestCallback = async (req, res) => {
  // #swagger.tags = ['Request']
  // #swagger.description = 'External system reports the outcome of a previously created pending request'
  /* #swagger.parameters['obj'] = {
       in: 'body',
       required: true,
       description: 'Callback payload from the external system',
       schema: { requestId: 'any', externalEventId: 'any', result: 'any' }
  } */

  const { requestId, externalEventId, result } = req.body

  if (!requestId || !externalEventId) {
    return res.status(400).json({ message: 'Missing requestId or externalEventId' })
  }

  try {
    // externalEventId should be UNIQUE in the DB (add a unique index).
    // If this insert fails on the unique constraint, we've already
    // processed this event — treat as a no-op success, not an error.
    const dedupeQuery = SQL.model(Pending.ProcessedCallback)
      .insert({ eventId: externalEventId, requestId, receivedAt: new Date() })
      .build()

    try {
      await Query(dedupeQuery.sql, dedupeQuery.bindings)
    } catch (dupeErr) {
      if (dupeErr.code === 'ER_DUP_ENTRY' || dupeErr.code === '23505') {
        return res.status(200).json({ message: 'Already processed' })
      }
      throw dupeErr
    }

    const requestQuery = SQL.model(Pending.Request)
      .select()
      .where(Pending.Request.cols.requestId, requestId)
      .build()

    const requestRows = await Query(requestQuery.sql, requestQuery.bindings)
    const request = requestRows?.[0]

    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    const currentStatus = request[Pending.Request.cols.status] ?? request.status

    const nextStatus = result === 'success' ? REQUEST_STATUS.CONFIRMED : REQUEST_STATUS.FAILED

    if (!canTransition(currentStatus, nextStatus)) {
      // Not an error necessarily — e.g. a late retry after we already
      // moved on. Log it, don't crash, don't dispatch.
      console.log(`Ignoring illegal transition ${currentStatus} -> ${nextStatus} for ${requestId}`)
      return res.status(200).json({ message: 'Ignored — state already advanced' })
    }

    const updateQuery = SQL.model(Pending.Request)
      .update({ [Pending.Request.cols.status]: nextStatus })
      .where(Pending.Request.cols.requestId, requestId)
      .build()

    await Query(updateQuery.sql, updateQuery.bindings)

    // Dispatch is a SEPARATE step — see section 4. Don't inline it here.
    if (nextStatus === REQUEST_STATUS.CONFIRMED) {
      await evaluateForDispatch(requestId)
    }

    return res.status(200).json({ message: 'Callback processed' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error processing callback' })
  }
}

module.exports = { handleRequestCallback }
