const { v4: uuidv4 } = require('uuid')
const { Query, Transaction, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Master } = require('../database/models/Master')
const SQL = new SQLQueryBuilder()

/**
 * @name UpsertMasterBranch
 * @description Update and insert Branch
 */
const upsertMasterBranch = async (req, res) => {
  // #swagger.tags = ['Branch']
  // #swagger.description = 'Upsert Branch'
  // #swagger.autoBody = false
  // #swagger.consumes = ['application/x-www-form-urlencoded']
  /* 
  //   #swagger.parameters['id'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Branch id'
  //   }
  //   #swagger.parameters['branch_name'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Branch branch_name'
  //   }
  //   #swagger.parameters['company_name'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Branch company_name'
  //   }
  //   #swagger.parameters['address'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Branch address'
  //   }
  //   #swagger.parameters['email'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Branch email'
  //   }
  //   #swagger.parameters['contact_number'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Branch contact_number'
  //   }
  */

  // Destructure only the non-system keys from req.body
  const { id, branch_name, company_name, address, email, contact_number } = req.body

  let query

  try {
    if (id) {
      let updateData = {}
      if (branch_name !== undefined) updateData[Master.Branch.cols.branch_name] = branch_name
      if (company_name !== undefined) updateData[Master.Branch.cols.company_name] = company_name
      if (address !== undefined) updateData[Master.Branch.cols.address] = address
      if (email !== undefined) updateData[Master.Branch.cols.email] = email
      if (contact_number !== undefined)
        updateData[Master.Branch.cols.contact_number] = contact_number

      if (Master.Branch.cols.updatedAt) updateData[Master.Branch.cols.updatedAt] = new Date()
      if (Master.Branch.cols.updatedBy) updateData[Master.Branch.cols.updatedBy] = userId

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No data to update' })
      } else {
        query = SQL.model(Master.Branch).update(updateData).where(Master.Branch.pk, id).build()
      }
    } else {
      // Basic validation for inserts (modify as needed)
      if (!branch_name) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      query = SQL.model(Master.Branch)
        .insert({
          [Master.Branch.pk]: uuidv4(),
          [Master.Branch.cols.branch_name]: branch_name,
          [Master.Branch.cols.company_name]: company_name,
          [Master.Branch.cols.address]: address,
          [Master.Branch.cols.email]: email,
          [Master.Branch.cols.contact_number]: contact_number,
          ...(Master.Branch.cols.companyId ? { [Master.Branch.cols.companyId]: companyId } : {}),
          ...(Master.Branch.cols.createdBy ? { [Master.Branch.cols.createdBy]: userId } : {}),
          ...(Master.Branch.cols.createdAt ? { [Master.Branch.cols.createdAt]: new Date() } : {}),
        })
        .build()
    }

    const result = await Query(query.sql, query.bindings)

    if (id && result.affectedRows === 0) {
      return res.status(404).json({ message: 'Branch not found' })
    }

    res.status(200).json({
      message: id ? 'Updated successfully' : 'Created successfully',
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error processing Branch' })
  }
}

/**
 * @name getMasterBranch
 * @description Get all Branch records
 */
const getMasterBranch = async (req, res) => {
  // #swagger.tags = ['Branch']
  // #swagger.description = 'Get all Branch records'
  /* #swagger.responses[200] = {
    description: 'List of branches',
    schema: [{ $ref: '#/definitions/Branch' }]
  } */

  try {
    const { sql, bindings } = SQL.model(Master.Branch)
      .select([
        Master.Branch.cols.id,
        Master.Branch.cols.branch_name,
        Master.Branch.cols.company_name,
        Master.Branch.cols.address,
        Master.Branch.cols.email,
        Master.Branch.cols.contact_number,
        Master.Branch.cols.isActive,
        Master.Branch.cols.createdAt,
        Master.Branch.cols.updatedAt,
      ])
      // .where(Master.Branch.cols.companyId, companyId) // Uncomment if company-scoped
      .build()

    const result = await Query(sql, bindings)

    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error retrieving Branch records' })
  }
}

module.exports = {
  getMasterBranch,
  upsertMasterBranch,
}
