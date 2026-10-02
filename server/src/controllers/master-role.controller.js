const { v4: uuidv4 } = require('uuid')
const { Query, Transaction, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Master } = require('../database/models/Master')
const SQL = new SQLQueryBuilder()

/**
 * @name UpsertMasterRole
 * @description Update and insert Role
 */
const upsertMasterRole = async (req, res) => {
  // #swagger.tags = ['Role']
  // #swagger.description = 'Upsert Role'
  // #swagger.autoBody = false
  // #swagger.consumes = ['application/x-www-form-urlencoded']
  /* 
  //   #swagger.parameters['id'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Role id'
  //   }
  //   #swagger.parameters['role_name'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Role role_name'
  //   }
  //   #swagger.parameters['description'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Role description'
  //   }
  //   #swagger.parameters['is_active'] = {
  //     in: 'formData',
  //     type: 'integer',
  //     enum: [1,0],
  //     required: false,
  //     description: 'Role is_active'
  //   }
  */
  
  // Destructure only the non-system keys from req.body
  const { id, role_name, description, is_active } = req.body
  
  let query

  try {
    if (id) {
      let updateData = {}
      if (role_name !== undefined) updateData[Master.Role.cols.role_name] = role_name
      if (description !== undefined) updateData[Master.Role.cols.description] = description
      if (is_active !== undefined) updateData[Master.Role.cols.is_active] = is_active

      if (Master.Role.cols.updatedAt) updateData[Master.Role.cols.updatedAt] = new Date()
      if (Master.Role.cols.updatedBy) updateData[Master.Role.cols.updatedBy] = userId

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No data to update' })
      } else {
        query = SQL.model(Master.Role)
          .update(updateData)
          .where(Master.Role.pk, id)
          .build()
      }
    } else {
      // Basic validation for inserts (modify as needed)
      if (!role_name) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      query = SQL.model(Master.Role)
        .insert({
          [Master.Role.pk]: uuidv4(),
          [Master.Role.cols.role_name]: role_name,
          [Master.Role.cols.description]: description,
          [Master.Role.cols.is_active]: is_active,
          ...( Master.Role.cols.companyId ? { [Master.Role.cols.companyId]: companyId } : {} ),
          ...( Master.Role.cols.createdBy ? { [Master.Role.cols.createdBy]: userId } : {} ),
          ...( Master.Role.cols.createdAt ? { [Master.Role.cols.createdAt]: new Date() } : {} ),
        })
        .build()
    }

    const result = await Query(query.sql, query.bindings)

    if (id && result.affectedRows === 0) {
      return res.status(404).json({ message: 'Role not found' })
    }

    res.status(200).json({
      message: id ? 'Updated successfully' : 'Created successfully',
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error processing Role' })
  }
}

/**
 * @name getMasterRole
 * @description Get all Role records
 */
const getMasterRole = async (req, res) => {
  // #swagger.tags = ['Role']
  // #swagger.description = 'Get all Role records'

  try {
    const { sql, bindings } = SQL.model(Master.Role)
      .select([
        Master.Role.cols.id,
        Master.Role.cols.role_name,
        Master.Role.cols.description,
        Master.Role.cols.is_active,
        Master.Role.cols.createdAt,
        Master.Role.cols.updatedAt
      ])
      // .where(Master.Role.cols.companyId, companyId) // Uncomment if company-scoped
      .build()

    const result = await Query(sql, bindings)

    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error retrieving Role records' })
  }
}

module.exports = {
  getMasterRole,
  upsertMasterRole
}
