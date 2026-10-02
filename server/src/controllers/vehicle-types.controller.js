const { v4: uuidv4 } = require('uuid')
const { Query, Transaction, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Vehicle } = require('../database/models/Vehicle')
const SQL = new SQLQueryBuilder()

/**
 * @name UpsertVehicleTypes
 * @description Update and insert Types
 */
const upsertVehicleTypes = async (req, res) => {
  // #swagger.tags = ['Vehicle Types']
  // #swagger.description = 'Upsert Types'
  // #swagger.autoBody = false
  // #swagger.consumes = ['application/x-www-form-urlencoded']
  /* 
  //   #swagger.parameters['id'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Types id'
  //   }
  //   #swagger.parameters['name'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Types name'
  //   }
  //   #swagger.parameters['description'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Types description'
  //   }
  //   #swagger.parameters['is_active'] = {
  //     in: 'formData',
  //     type: 'integer',
  //     enum: [1,0],
  //     required: false,
  //     description: 'Types is_active'
  //   }
  //   #swagger.parameters['created_at'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Types created_at'
  //   }
  //   #swagger.parameters['updated_at'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Types updated_at'
  //   }
  */

  // Destructure only the non-system keys from req.body
  const { id, name, description, is_active, created_at, updated_at } = req.body

  let query
  try {
    const now = new Date()

    if (id) {
      const updateData = {}
      if (name !== undefined) updateData[Vehicle.Types.cols.name] = name
      if (description !== undefined) updateData[Vehicle.Types.cols.description] = description
      if (is_active !== undefined) updateData[Vehicle.Types.cols.isActive] = Number(is_active)
      updateData[Vehicle.Types.cols.updated_at] = updated_at || now

      query = SQL.model(Vehicle.Types).update(updateData).where(Vehicle.Types.pk, id).build()
    } else {
      if (!name) return res.status(400).json({ message: 'Missing required fields' })

      query = SQL.model(Vehicle.Types)
        .insert({
          [Vehicle.Types.pk]: uuidv4(),
          [Vehicle.Types.cols.name]: name,
          [Vehicle.Types.cols.description]: description,
          [Vehicle.Types.cols.isActive]: is_active !== undefined ? Number(is_active) : 1,
          [Vehicle.Types.cols.created_at]: created_at || now,
          [Vehicle.Types.cols.updated_at]: updated_at || now,
        })
        .build()
    }
    // ...rest unchanged (Query, affectedRows check, response)

    const result = await Query(query.sql, query.bindings)

    if (id && result.affectedRows === 0) {
      return res.status(404).json({ message: 'Types not found' })
    }

    res.status(200).json({
      message: id ? 'Updated successfully' : 'Created successfully',
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error processing Types' })
  }
}

/**
 * @name getVehicleTypes
 * @description Get all Types records
 */
const getVehicleTypes = async (req, res) => {
  // #swagger.tags = ['Vehicle Types']
  // #swagger.description = 'Get all Types records'

  try {
    const { sql, bindings } = SQL.model(Vehicle.Types)
      .select([
        Vehicle.Types.cols.id,
        Vehicle.Types.cols.name,
        Vehicle.Types.cols.description,
        Vehicle.Types.cols.isActive,
        Vehicle.Types.cols.created_at,
        Vehicle.Types.cols.updated_at,
      ])
      // .where(Vehicle.Types.cols.companyId, companyId) // Uncomment if company-scoped
      .build()

    const result = await Query(sql, bindings)

    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error retrieving Types records' })
  }
}

module.exports = {
  getVehicleTypes,
  upsertVehicleTypes,
}
