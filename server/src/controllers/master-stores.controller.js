const { v4: uuidv4 } = require('uuid')
const { Query, Transaction, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Master } = require('../database/models/Master')
const SQL = new SQLQueryBuilder()

/**
 * @name UpsertMasterStores
 * @description Update and insert Stores
 */
const upsertMasterStores = async (req, res) => {
  // #swagger.tags = ['Stores']
  // #swagger.description = 'Upsert Stores'
  // #swagger.autoBody = false
  // #swagger.consumes = ['application/x-www-form-urlencoded']
  /* 
  //   #swagger.parameters['id'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Stores id'
  //   }
  //   #swagger.parameters['store_name'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Stores store_name'
  //   }
  //   #swagger.parameters['store_code'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Stores store_code'
  //   }
  //   #swagger.parameters['store_address'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Stores store_address'
  //   }
  //   #swagger.parameters['contact_person'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Stores contact_person'
  //   }
  //   #swagger.parameters['contact_number'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Stores contact_number'
  //   }
  //   #swagger.parameters['is_active'] = {
  //     in: 'formData',
  //     type: 'boolean',
  //     required: false,
  //     description: 'Stores is_active'
  //   }
  */

  // Extract user identifiers from middleware if available
  const userId = req.user?.id || req.user?.userId || null
  const companyId = req.user?.companyId || null

  // Destructure non-system keys from req.body
  let { id, store_name, store_code, store_address, contact_person, contact_number, is_active } =
    req.body

  // Normalize is_active to a strict integer (1 or 0) to match MySQL tinyint(1)
  if (is_active !== undefined) {
    is_active =
      is_active === true || is_active === 'true' || is_active === 1 || is_active === '1' ? 1 : 0
  }

  let query

  try {
    if (id) {
      let updateData = {}
      if (store_name !== undefined) updateData[Master.Stores.cols.store_name] = store_name
      if (store_code !== undefined) updateData[Master.Stores.cols.store_code] = store_code
      if (store_address !== undefined) updateData[Master.Stores.cols.store_address] = store_address
      if (contact_person !== undefined)
        updateData[Master.Stores.cols.contact_person] = contact_person
      if (contact_number !== undefined)
        updateData[Master.Stores.cols.contact_number] = contact_number
      if (is_active !== undefined) updateData[Master.Stores.cols.is_active] = is_active

      if (Master.Stores.cols.updatedAt) updateData[Master.Stores.cols.updatedAt] = new Date()
      if (Master.Stores.cols.updatedBy && userId) updateData[Master.Stores.cols.updatedBy] = userId

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No data to update' })
      } else {
        query = SQL.model(Master.Stores).update(updateData).where(Master.Stores.pk, id).build()
      }
    } else {
      // Basic validation for inserts (modify as needed)
      if (!store_name || !store_code) {
        return res
          .status(400)
          .json({ message: 'Missing required fields: store_name or store_code' })
      }

      query = SQL.model(Master.Stores)
        .insert({
          [Master.Stores.pk]: uuidv4(),
          [Master.Stores.cols.store_name]: store_name,
          [Master.Stores.cols.store_code]: store_code,
          [Master.Stores.cols.store_address]: store_address,
          [Master.Stores.cols.contact_person]: contact_person,
          [Master.Stores.cols.contact_number]: contact_number,
          [Master.Stores.cols.is_active]: is_active !== undefined ? is_active : 1,
          ...(Master.Stores.cols.companyId && companyId
            ? { [Master.Stores.cols.companyId]: companyId }
            : {}),
          ...(Master.Stores.cols.createdBy && userId
            ? { [Master.Stores.cols.createdBy]: userId }
            : {}),
          ...(Master.Stores.cols.createdAt ? { [Master.Stores.cols.createdAt]: new Date() } : {}),
        })
        .build()
    }

    const result = await Query(query.sql, query.bindings)

    if (id && result.affectedRows === 0) {
      return res.status(404).json({ message: 'Stores not found' })
    }

    return res.status(200).json({
      message: id ? 'Updated successfully' : 'Created successfully',
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error processing Stores' })
  }
}

/**
 * @name getMasterStores
 * @description Get all Stores records
 */
const getMasterStores = async (req, res) => {
  // #swagger.tags = ['Stores']
  // #swagger.description = 'Get all Stores records'

  try {
    const { sql, bindings } = SQL.model(Master.Stores)
      .select([
        Master.Stores.cols.id,
        Master.Stores.cols.store_name,
        Master.Stores.cols.store_code,
        Master.Stores.cols.store_address,
        Master.Stores.cols.contact_person,
        Master.Stores.cols.contact_number,
        Master.Stores.cols.is_active,
      ])
      .build()

    const queryResult = await Query(sql, bindings)

    // Extract the actual rows array safely (supports both [rows, fields] and flat array patterns)
    const rows =
      Array.isArray(queryResult) && Array.isArray(queryResult[0]) ? queryResult[0] : queryResult

    return res.status(200).json(rows)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error retrieving Stores records' })
  }
}

module.exports = {
  getMasterStores,
  upsertMasterStores,
}
