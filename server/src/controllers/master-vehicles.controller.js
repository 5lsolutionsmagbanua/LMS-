const { v4: uuidv4 } = require('uuid')
const { Query, Transaction, SQLQueryBuilder } = require('../database/utilities/queries.util')
const { Master } = require('../database/models/Master')
const SQL = new SQLQueryBuilder()

/**
 * @name UpsertMasterVehicles
 * @description Update and insert Vehicles
 */
const upsertMasterVehicles = async (req, res) => {
  // #swagger.tags = ['Vehicles']
  // #swagger.description = 'Upsert Vehicles'
  // #swagger.autoBody = false
  // #swagger.consumes = ['application/x-www-form-urlencoded']
  /* 
  //   #swagger.parameters['id'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles id'
  //   }
  //   #swagger.parameters['plate_number'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles plate_number'
  //   }
  //   #swagger.parameters['vehicleTypeId'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles vehicleTypeId'
  //   }
  //   #swagger.parameters['vehicleImage'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles vehicleImage'
  //   }
  //   #swagger.parameters['brand'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles brand'
  //   }
  //   #swagger.parameters['model'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles model'
  //   }
  //   #swagger.parameters['capacity'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles capacity'
  //   }
  //   #swagger.parameters['color'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles color'
  //   }
  //   #swagger.parameters['fuel_type'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles fuel_type'
  //   }
  //   #swagger.parameters['odometer'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles odometer'
  //   }
  //   #swagger.parameters['file_number'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles file_number'
  //   }
  //   #swagger.parameters['or_number'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles or_number'
  //   }
  //   #swagger.parameters['cr_number'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles cr_number'
  //   }
  //   #swagger.parameters['registration_expiry'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles registration_expiry (YYYY-MM-DD)'
  //   }
  //   #swagger.parameters['remarks'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles remarks'
  //   }
  //   #swagger.parameters['status'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles status'
  //   }
  //   #swagger.parameters['created_at'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles created_at'
  //   }
  //   #swagger.parameters['updated_at'] = {
  //     in: 'formData',
  //     type: 'string',
  //     required: false,
  //     description: 'Vehicles updated_at'
  //   }
  */

  const {
    id,
    plate_number,
    vehicleTypeId,
    vehicleImage,
    brand,
    model,
    capacity,
    color,
    fuel_type,
    odometer,
    file_number,
    or_number,
    cr_number,
    registration_expiry,
    remarks,
    status,
    created_at,
    updated_at,
  } = req.body

  // Safeguard: Ensure registration_expiry is a valid date string
  const cleanExpiry =
    registration_expiry && registration_expiry !== 'true' && registration_expiry !== 'false'
      ? registration_expiry
      : null

  // Generate safe fallback timestamps to prevent null database errors
  const now = new Date()
  const finalCreatedAt =
    created_at && created_at !== 'null' && created_at !== 'undefined' ? created_at : now
  const finalUpdatedAt =
    updated_at && updated_at !== 'null' && updated_at !== 'undefined' ? updated_at : now

  let query

  try {
    if (id) {
      let updateData = {}
      if (plate_number !== undefined) updateData[Master.Vehicles.cols.plate_number] = plate_number
      if (vehicleTypeId !== undefined)
        updateData[Master.Vehicles.cols.vehicleTypeId] = vehicleTypeId
      if (vehicleImage !== undefined) updateData[Master.Vehicles.cols.vehicleImage] = vehicleImage
      if (brand !== undefined) updateData[Master.Vehicles.cols.brand] = brand
      if (model !== undefined) updateData[Master.Vehicles.cols.model] = model
      if (capacity !== undefined) updateData[Master.Vehicles.cols.capacity] = capacity
      if (color !== undefined) updateData[Master.Vehicles.cols.color] = color
      if (fuel_type !== undefined) updateData[Master.Vehicles.cols.fuel_type] = fuel_type
      if (odometer !== undefined) updateData[Master.Vehicles.cols.odometer] = odometer
      if (file_number !== undefined) updateData[Master.Vehicles.cols.file_number] = file_number
      if (or_number !== undefined) updateData[Master.Vehicles.cols.or_number] = or_number
      if (cr_number !== undefined) updateData[Master.Vehicles.cols.cr_number] = cr_number
      if (registration_expiry !== undefined)
        updateData[Master.Vehicles.cols.registration_expiry] = cleanExpiry
      if (remarks !== undefined) updateData[Master.Vehicles.cols.remarks] = remarks
      if (status !== undefined) updateData[Master.Vehicles.cols.status] = status

      updateData[Master.Vehicles.cols.updated_at] = finalUpdatedAt

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No data to update' })
      } else {
        query = SQL.model(Master.Vehicles).update(updateData).where(Master.Vehicles.pk, id).build()
      }
    } else {
      if (!plate_number) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      query = SQL.model(Master.Vehicles)
        .insert({
          [Master.Vehicles.pk]: uuidv4(),
          [Master.Vehicles.cols.plate_number]: plate_number,
          [Master.Vehicles.cols.vehicleTypeId]: vehicleTypeId,
          [Master.Vehicles.cols.vehicleImage]: vehicleImage,
          [Master.Vehicles.cols.brand]: brand,
          [Master.Vehicles.cols.model]: model,
          [Master.Vehicles.cols.capacity]: capacity,
          [Master.Vehicles.cols.color]: color,
          [Master.Vehicles.cols.fuel_type]: fuel_type,
          [Master.Vehicles.cols.odometer]: odometer || 0,
          [Master.Vehicles.cols.file_number]: file_number,
          [Master.Vehicles.cols.or_number]: or_number,
          [Master.Vehicles.cols.cr_number]: cr_number,
          [Master.Vehicles.cols.registration_expiry]: cleanExpiry,
          [Master.Vehicles.cols.remarks]: remarks,
          [Master.Vehicles.cols.status]: status || 'Available',
          [Master.Vehicles.cols.created_at]: finalCreatedAt,
          [Master.Vehicles.cols.updated_at]: finalUpdatedAt,
        })
        .build()
    }

    const result = await Query(query.sql, query.bindings)

    if (id && result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vehicles not found' })
    }

    res.status(200).json({
      message: id ? 'Updated successfully' : 'Created successfully',
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error processing Vehicles' })
  }
}

/**
 * @name getMasterVehicles
 * @description Get all Vehicles records
 */
const getMasterVehicles = async (req, res) => {
  // #swagger.tags = ['Vehicles']
  // #swagger.description = 'Get all Vehicles records'

  try {
    const { sql, bindings } = SQL.model(Master.Vehicles)
      .select([
        Master.Vehicles.cols.id,
        Master.Vehicles.cols.plate_number,
        Master.Vehicles.cols.vehicleTypeId,
        Master.Vehicles.cols.vehicleImage,
        Master.Vehicles.cols.brand,
        Master.Vehicles.cols.model,
        Master.Vehicles.cols.capacity,
        Master.Vehicles.cols.color,
        Master.Vehicles.cols.fuel_type,
        Master.Vehicles.cols.odometer,
        Master.Vehicles.cols.file_number,
        Master.Vehicles.cols.or_number,
        Master.Vehicles.cols.cr_number,
        Master.Vehicles.cols.registration_expiry,
        Master.Vehicles.cols.remarks,
        Master.Vehicles.cols.status,
        Master.Vehicles.cols.created_at,
        Master.Vehicles.cols.updated_at,
      ])
      .build()

    const result = await Query(sql, bindings)

    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error retrieving Vehicles records' })
  }
}

module.exports = {
  getMasterVehicles,
  upsertMasterVehicles,
}
