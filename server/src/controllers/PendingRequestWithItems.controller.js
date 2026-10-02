// server/src/controllers/PendingRequestWithItems.controller.js
const { v4: uuidv4 } = require('uuid')
const { Query, Transaction, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Pending } = require('../database/models/Pending')
const { Master } = require('../database/models/Master')
const SQL = new SQLQueryBuilder()

// ─────────────────────────────────────────────────────────────────────────
// Shared UUID helpers
// ─────────────────────────────────────────────────────────────────────────

// UUID v1-v5 format check (case-insensitive)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isValidUUID = (value) => typeof value === 'string' && UUID_REGEX.test(value)

/**
 * Given a map of { fieldLabel: uuidValue }, finds any UUID value that's
 * reused across two or more DIFFERENT fields (e.g. requestId === storeId).
 * Falsy values are ignored (handled by required-field checks elsewhere).
 * Returns an array of { value, fields } collision groups.
 */
const findDuplicateUUIDs = (fieldMap) => {
  const seen = new Map() // uuidValue -> [fieldLabels]
  for (const [label, value] of Object.entries(fieldMap)) {
    if (!value) continue
    if (!seen.has(value)) seen.set(value, [])
    seen.get(value).push(label)
  }

  const duplicates = []
  for (const [value, labels] of seen.entries()) {
    if (labels.length > 1) duplicates.push({ value, fields: labels })
  }
  return duplicates
}

const duplicateUUIDMessage = (duplicates) =>
  duplicates.map((d) => `${d.fields.join(' & ')} share the same UUID (${d.value})`).join('; ')

/**
 * @name getPendingRequests
 * @description List all pending requests for the dashboard, joined against
 *              branch/store so the UI shows names instead of raw UUIDs.
 */
const getPendingRequests = async (req, res) => {
  // #swagger.tags = ['Request']
  // #swagger.description = 'Get all pending requests (dashboard view)'

  try {
    const { sql, bindings } = SQL.model(Pending.Request)
      .select([
        { col: Pending.Request.cols.id, as: 'id' },
        { col: Pending.Request.cols.requestId, as: 'requestId' },
        { col: Pending.Request.cols.ticketNumber, as: 'ticketNumber' },
        { col: Pending.Request.cols.branchId, as: 'branchId' },
        { col: Master.Branch.cols.branch_name, as: 'branchName' },
        { col: Pending.Request.cols.storeId, as: 'storeId' },
        { col: Master.Stores.cols.store_name, as: 'storeName' },
        { col: Pending.Request.cols.requestType, as: 'requestType' },
        { col: Pending.Request.cols.status, as: 'status' },
        { col: Pending.Request.cols.notes, as: 'notes' },
        { col: Pending.Request.cols.createdAt, as: 'createdAt' },
      ])
      .leftJoin(Master.Branch.table, Pending.Request.cols.branchId, Master.Branch.pk)
      .leftJoin(Master.Stores.table, Pending.Request.cols.storeId, Master.Stores.pk)
      .orderBy(Pending.Request.cols.createdAt, 'DESC')
      .build()

    const requests = await Query(sql, bindings)

    const requestsWithItems = await Promise.all(
      requests.map(async (reqItem) => {
        const itemQuery = SQL.model(Pending.RequestItem)
          .select([
            { col: Pending.RequestItem.cols.id, as: 'id' },
            { col: Pending.RequestItem.cols.pendingRequestId, as: 'pendingRequestId' },
            { col: Pending.RequestItem.cols.stockId, as: 'stockId' },
            { col: Pending.RequestItem.cols.isSerialized, as: 'isSerialized' },
            { col: Pending.RequestItem.cols.stockQty, as: 'stockQty' },
            { col: Pending.RequestItem.cols.assetTag, as: 'assetTag' },
            { col: Pending.RequestItem.cols.serialNumber, as: 'serialNumber' },
          ])
          .where(Pending.RequestItem.cols.pendingRequestId, reqItem.id)
          .build()

        const items = await Query(itemQuery.sql, itemQuery.bindings)
        return {
          ...reqItem,
          items: items || [],
        }
      }),
    )

    return res.status(200).json(requestsWithItems)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error retrieving pending requests' })
  }
}

/**
 * @name getPendingRequestItems
 * @description Fetch line items for one request by its primary key id or requestId.
 */
const getPendingRequestItems = async (req, res) => {
  // #swagger.tags = ['Request']
  // #swagger.description = 'Get items for a single pending request'

  const { id } = req.params

  if (!id) {
    return res.status(400).json({ message: 'Missing request id' })
  }

  try {
    const { sql, bindings } = SQL.model(Pending.RequestItem)
      .select()
      .where(Pending.RequestItem.cols.pendingRequestId, id)
      .build()

    const rows = await Query(sql, bindings)

    return res.status(200).json(rows)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error retrieving request items' })
  }
}

/**
 * @name createPendingRequest
 * @description Create a new pending request with items.
 */
const createPendingRequest = async (req, res) => {
  // #swagger.tags = ['Request']
  // #swagger.description = 'Create a new pending request with items'
  /* #swagger.responses[201] = { description: "Created successfully" } */
  /* #swagger.responses[400] = { description: "Validation error" } */
  /* #swagger.responses[500] = { description: "Server error" } */

  const { ticketNumber, branchId, storeId, requestType, status, notes, items } = req.body
  const userId = req.session?.userId ?? req.user?.id ?? null

  try {
    if (!branchId) {
      return res.status(400).json({ message: 'Branch is required' })
    }
    if (!isValidUUID(branchId)) {
      return res.status(400).json({ message: 'branchId must be a valid UUID' })
    }
    if (storeId && !isValidUUID(storeId)) {
      return res.status(400).json({ message: 'storeId must be a valid UUID' })
    }
    if (!requestType) {
      return res.status(400).json({ message: 'Request type is required' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' })
    }

    for (let i = 0; i < items.length; i += 1) {
      if (!items[i]?.stockId || !isValidUUID(items[i].stockId)) {
        return res.status(400).json({ message: `items[${i}].stockId must be a valid UUID` })
      }
    }

    const fieldMap = { branchId, storeId: storeId || null }
    items.forEach((item, i) => {
      fieldMap[`items[${i}].stockId`] = item.stockId
    })
    const duplicates = findDuplicateUUIDs(fieldMap)
    if (duplicates.length) {
      return res.status(400).json({
        message: `Duplicate UUID used across fields: ${duplicateUUIDMessage(duplicates)}`,
      })
    }

    const newPrimaryId = uuidv4()
    const generatedRequestId = uuidv4()

    const requestQuery = SQL.model(Pending.Request)
      .insert({
        [Pending.Request.pk]: newPrimaryId,
        [Pending.Request.cols.requestId]: generatedRequestId,
        [Pending.Request.cols.ticketNumber]: ticketNumber || null,
        [Pending.Request.cols.branchId]: branchId,
        [Pending.Request.cols.storeId]: storeId || null,
        [Pending.Request.cols.requestType]: requestType,
        [Pending.Request.cols.status]: status ? status.toLowerCase() : 'pending',
        [Pending.Request.cols.notes]: notes || null,
        ...(Pending.Request.cols.createdBy ? { [Pending.Request.cols.createdBy]: userId } : {}),
        ...(Pending.Request.cols.createdAt ? { [Pending.Request.cols.createdAt]: new Date() } : {}),
      })
      .build()

    const itemQueries = items.map((item) =>
      SQL.model(Pending.RequestItem)
        .insert({
          [Pending.RequestItem.pk]: uuidv4(),
          [Pending.RequestItem.cols.pendingRequestId]: newPrimaryId,
          [Pending.RequestItem.cols.stockId]: item.stockId,
          [Pending.RequestItem.cols.isSerialized]: item.isSerialized ?? false,
          [Pending.RequestItem.cols.stockQty]: item.stockQty || 0,
          [Pending.RequestItem.cols.assetTag]: item.assetTag || null,
          [Pending.RequestItem.cols.serialNumber]: item.serialNumber || null,
        })
        .build(),
    )

    const allQueries = [requestQuery, ...itemQueries].map((q) => ({
      sql: q.sql,
      values: q.bindings,
    }))

    await Transaction(allQueries)

    return res.status(201).json({
      success: true,
      message: 'Created successfully',
      requestId: generatedRequestId,
    })
  } catch (error) {
    console.log(error)
    if (error.code === '23505' || error.errno === 1062) {
      return res
        .status(409)
        .json({ message: 'A request with this record identifier already exists.' })
    }
    return res.status(500).json({ message: 'Error processing Request with Items' })
  }
}

/**
 * @name upsertPendingRequestWithItems
 * @description Create or update a pending request from an external system
 */
const upsertPendingRequestWithItems = async (req, res) => {
  // #swagger.tags = ['Request']
  // #swagger.summary = 'Create or update a pending request from an external system'
  // #swagger.description = 'x-api-key authenticated endpoint.'
  // #swagger.security = [{ "ApiKeyAuth": [] }]
  /* #swagger.responses[201] = { description: "Created successfully" } */
  /* #swagger.responses[200] = { description: "Updated successfully" } */
  /* #swagger.responses[400] = { description: "Validation error" } */
  // #swagger.responses[401] = { description: "Missing or invalid x-api-key" }
  /* #swagger.responses[500] = { description: "Server error" } */

  const {
    requestId,
    ticketNumber,
    branchId,
    storeId,
    requestType,
    status,
    notes,
    stockId,
    isSerialized,
    stockQty,
    assetTag,
    serialNumber,
  } = req.body

  try {
    if (!requestId) {
      return res.status(400).json({ message: 'requestId is required' })
    }
    if (!isValidUUID(requestId)) {
      return res.status(400).json({ message: 'requestId must be a valid UUID' })
    }

    if (!branchId) {
      return res.status(400).json({ message: 'Branch is required' })
    }
    if (!isValidUUID(branchId)) {
      return res.status(400).json({ message: 'branchId must be a valid UUID' })
    }

    if (!stockId) {
      return res.status(400).json({ message: 'stockId is required' })
    }
    if (!isValidUUID(stockId)) {
      return res.status(400).json({ message: 'stockId must be a valid UUID' })
    }

    if (storeId && !isValidUUID(storeId)) {
      return res.status(400).json({ message: 'storeId must be a valid UUID' })
    }

    const duplicates = findDuplicateUUIDs({
      requestId,
      branchId,
      storeId: storeId || null,
      stockId,
    })
    if (duplicates.length) {
      return res.status(400).json({
        message: `Duplicate UUID used across fields: ${duplicateUUIDMessage(duplicates)}`,
      })
    }

    const normalizedIsSerialized = isSerialized === 'true' || isSerialized === true
    const normalizedAssetTag = assetTag || null
    const normalizedSerialNumber = serialNumber || null

    const existing = await Query(
      'SELECT pr_id FROM pending_request WHERE pr_requestId = ? LIMIT 1',
      [requestId],
    )
    const prId = existing?.[0]?.pr_id || uuidv4()
    const isUpdate = Boolean(existing?.[0]?.pr_id)

    if (normalizedIsSerialized && normalizedSerialNumber) {
      const dupeSerial = await Query(
        `SELECT pri_id FROM pending_request_item
         WHERE pri_serialNumber = ? AND pri_pendingRequestId != ?
         LIMIT 1`,
        [normalizedSerialNumber, prId],
      )
      if (dupeSerial?.length) {
        return res.status(400).json({
          message: `serialNumber '${normalizedSerialNumber}' is already used in another pending request`,
        })
      }
    }

    if (normalizedAssetTag) {
      const dupeAsset = await Query(
        `SELECT pri_id FROM pending_request_item
         WHERE pri_assetTag = ? AND pri_pendingRequestId != ?
         LIMIT 1`,
        [normalizedAssetTag, prId],
      )
      if (dupeAsset?.length) {
        return res.status(400).json({
          message: `assetTag '${normalizedAssetTag}' is already used in another pending request`,
        })
      }
    }

    const items = [
      {
        stockId,
        isSerialized: normalizedIsSerialized,
        stockQty: stockQty ? Number(stockQty) : 0,
        assetTag: normalizedAssetTag,
        serialNumber: normalizedSerialNumber,
      },
    ]

    const queries = []

    if (isUpdate) {
      queries.push({
        sql: `
          UPDATE pending_request SET
            pr_ticketNumber = ?, pr_branchId = ?, pr_storeId = ?, pr_requestType = ?,
            pr_status = ?, pr_notes = ?
          WHERE pr_id = ?
        `,
        values: [
          ticketNumber || null,
          branchId,
          storeId || null,
          requestType || null,
          status || 'Pending',
          notes || null,
          prId,
        ],
      })
      queries.push({
        sql: 'DELETE FROM pending_request_item WHERE pri_pendingRequestId = ?',
        values: [prId],
      })
    } else {
      queries.push({
        sql: `
          INSERT INTO pending_request
            (pr_id, pr_requestId, pr_ticketNumber, pr_branchId, pr_storeId,
             pr_requestType, pr_status, pr_createdDate, pr_createdBy, pr_notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        values: [
          prId,
          requestId,
          ticketNumber || null,
          branchId,
          storeId || null,
          requestType || null,
          status || 'Pending',
          new Date(),
          null,
          notes || null,
        ],
      })
    }

    for (const item of items) {
      queries.push({
        sql: `
          INSERT INTO pending_request_item
            (pri_id, pri_pendingRequestId, pri_stockId, pri_isSerialized,
             pri_stockQty, pri_assetTag, pri_serialNumber)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        values: [
          uuidv4(),
          prId,
          item.stockId,
          item.isSerialized,
          item.stockQty,
          item.assetTag,
          item.serialNumber,
        ],
      })
    }

    await Transaction(queries)

    return res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate ? 'Updated successfully' : 'Created successfully',
      requestId,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error processing Request with Items' })
  }
}

/**
 * @name updatePendingRequest
 * @description Update an existing pending request and replace its line items.
 */
const updatePendingRequest = async (req, res) => {
  // #swagger.tags = ['Request']
  // #swagger.description = 'Update a pending request and its line items'

  const { id } = req.params
  const { ticketNumber, branchId, storeId, requestType, status, notes, items } = req.body

  if (!id) {
    return res.status(400).json({ message: 'Missing request id' })
  }

  try {
    if (!branchId) {
      return res.status(400).json({ message: 'Branch is required' })
    }
    if (!isValidUUID(branchId)) {
      return res.status(400).json({ message: 'branchId must be a valid UUID' })
    }
    if (storeId && !isValidUUID(storeId)) {
      return res.status(400).json({ message: 'storeId must be a valid UUID' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required' })
    }

    for (let i = 0; i < items.length; i += 1) {
      if (!items[i]?.stockId || !isValidUUID(items[i].stockId)) {
        return res.status(400).json({ message: `items[${i}].stockId must be a valid UUID` })
      }
    }

    const fieldMap = { branchId, storeId: storeId || null }
    items.forEach((item, i) => {
      fieldMap[`items[${i}].stockId`] = item.stockId
    })
    const duplicates = findDuplicateUUIDs(fieldMap)
    if (duplicates.length) {
      return res.status(400).json({
        message: `Duplicate UUID used across fields: ${duplicateUUIDMessage(duplicates)}`,
      })
    }

    const findQuery = SQL.model(Pending.Request)
      .select([{ col: Pending.Request.cols.id, as: 'internalId' }])
      .where(Pending.Request.cols.requestId, id)
      .build()

    const existingRows = await Query(findQuery.sql, findQuery.bindings)
    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({ message: 'Pending request not found' })
    }

    const internalId = existingRows[0].internalId

    const updateRequestQuery = SQL.model(Pending.Request)
      .update({
        [Pending.Request.cols.ticketNumber]: ticketNumber || null,
        [Pending.Request.cols.branchId]: branchId,
        [Pending.Request.cols.storeId]: storeId || null,
        [Pending.Request.cols.requestType]: requestType,
        [Pending.Request.cols.status]: status ? status.toLowerCase() : 'pending',
        [Pending.Request.cols.notes]: notes || null,
      })
      .where(Pending.Request.cols.id, internalId)
      .build()

    const deleteItemsQuery = SQL.model(Pending.RequestItem)
      .delete()
      .where(Pending.RequestItem.cols.pendingRequestId, internalId)
      .build()

    const newItemQueries = items.map((item) =>
      SQL.model(Pending.RequestItem)
        .insert({
          [Pending.RequestItem.pk]: uuidv4(),
          [Pending.RequestItem.cols.pendingRequestId]: internalId,
          [Pending.RequestItem.cols.stockId]: item.stockId,
          [Pending.RequestItem.cols.isSerialized]: item.isSerialized ?? false,
          [Pending.RequestItem.cols.stockQty]: item.stockQty || 0,
          [Pending.RequestItem.cols.assetTag]: item.assetTag || null,
          [Pending.RequestItem.cols.serialNumber]: item.serialNumber || null,
        })
        .build(),
    )

    const allQueries = [updateRequestQuery, deleteItemsQuery, ...newItemQueries].map((q) => ({
      sql: q.sql,
      values: q.bindings,
    }))

    await Transaction(allQueries)

    return res.status(200).json({
      success: true,
      message: 'Updated successfully',
      requestId: id,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error updating Request with Items' })
  }
}

module.exports = {
  getPendingRequests,
  getPendingRequestItems,
  createPendingRequest,
  upsertPendingRequestWithItems,
  updatePendingRequest,
}
