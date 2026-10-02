const { v4: uuidv4 } = require('uuid')
const { Query, Transaction, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { EncryptString } = require('../utilities/cryptography.util')
const { Master } = require('../database/models/Master')
const SQL = new SQLQueryBuilder()

/**
 * @name UpsertMasterUsers
 * @description Update and insert Users
 */
const upsertMasterUsers = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Upsert Users'
  // #swagger.autoBody = false
  // #swagger.consumes = ['application/x-www-form-urlencoded']
  /* 
  //   #swagger.parameters['id'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Users id'
  //   }
  //   #swagger.parameters['branch_id'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Users branch_id'
  //   }
  //   #swagger.parameters['role_id'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Users role_id'
  //   }
  //   #swagger.parameters['first_name'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Users first_name'
  //   }
  //   #swagger.parameters['last_name'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Users last_name'
  //   }
  //   #swagger.parameters['email'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Users email'
  //   }
  //   #swagger.parameters['username'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Users username'
  //   }
  //   #swagger.parameters['password'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Users password'
  //   }
  */

  // Destructure only the non-system keys from req.body
  const { id, branch_id, role_id, first_name, last_name, email, username, password } = req.body

  let query

  try {
    if (id) {
      let updateData = {}
      if (branch_id !== undefined) updateData[Master.Users.cols.branch_id] = branch_id
      if (role_id !== undefined) updateData[Master.Users.cols.role_id] = role_id
      if (first_name !== undefined) updateData[Master.Users.cols.first_name] = first_name
      if (last_name !== undefined) updateData[Master.Users.cols.last_name] = last_name
      if (email !== undefined) updateData[Master.Users.cols.email] = email
      if (username !== undefined) updateData[Master.Users.cols.username] = username
      if (password !== undefined) updateData[Master.Users.cols.password] = EncryptString(password)

      if (Master.Users.cols.updatedAt) updateData[Master.Users.cols.updatedAt] = new Date()
      if (Master.Users.cols.updatedBy) updateData[Master.Users.cols.updatedBy] = userId

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No data to update' })
      } else {
        query = SQL.model(Master.Users).update(updateData).where(Master.Users.pk, id).build()
      }
    } else {
      // Basic validation for inserts (modify as needed)
      if (!branch_id) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      query = SQL.model(Master.Users)
        .insert({
          [Master.Users.pk]: uuidv4(),
          [Master.Users.cols.branch_id]: branch_id,
          [Master.Users.cols.role_id]: role_id,
          [Master.Users.cols.first_name]: first_name,
          [Master.Users.cols.last_name]: last_name,
          [Master.Users.cols.email]: email,
          [Master.Users.cols.username]: username,
          [Master.Users.cols.password]: EncryptString(password),
          ...(Master.Users.cols.companyId ? { [Master.Users.cols.companyId]: companyId } : {}),
          ...(Master.Users.cols.createdBy ? { [Master.Users.cols.createdBy]: userId } : {}),
          ...(Master.Users.cols.createdAt ? { [Master.Users.cols.createdAt]: new Date() } : {}),
        })
        .build()
    }

    const result = await Query(query.sql, query.bindings)

    if (id && result.affectedRows === 0) {
      return res.status(404).json({ message: 'Users not found' })
    }

    res.status(200).json({
      message: id ? 'Updated successfully' : 'Created successfully',
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error processing Users' })
  }
}

/**
 * @name getMasterUsers
 * @description Get all Users records
 */
const getMasterUsers = async (req, res) => {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Get all Users records'

  try {
    const { sql, bindings } = SQL.model(Master.Users)
      .select([
        Master.Users.cols.id,
        Master.Users.cols.branch_id,
        Master.Users.cols.role_id,
        Master.Users.cols.first_name,
        Master.Users.cols.last_name,
        Master.Users.cols.email,
        Master.Users.cols.username,
        Master.Users.cols.password,
        Master.Users.cols.isActive,
        Master.Users.cols.createdAt,
        Master.Users.cols.updatedAt,
      ])
      // .where(Master.Users.cols.companyId, companyId) // Uncomment if company-scoped
      .build()

    const result = await Query(sql, bindings)

    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error retrieving Users records' })
  }
}

module.exports = {
  getMasterUsers,
  upsertMasterUsers,
}
