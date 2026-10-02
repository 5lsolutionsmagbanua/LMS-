/**
 * ⚠️ AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 */

/**
 * @typedef {Object} RoleCols
 * @property {'mr_id'} id
 * @property {'mr_role_name'} role_name
 * @property {'mr_description'} description
 * @property {'mr_is_active'} is_active
 * @property {'mr_createdAt'} createdAt
 * @property {'mr_updatedAt'} updatedAt
 */

/**
 * @typedef {Object} BranchCols
 * @property {'mb_id'} id
 * @property {'mb_branch_name'} branch_name
 * @property {'mb_company_name'} company_name
 * @property {'mb_address'} address
 * @property {'mb_email'} email
 * @property {'mb_contact_number'} contact_number
 * @property {'mb_isActive'} isActive
 * @property {'mb_createdAt'} createdAt
 * @property {'mb_updatedAt'} updatedAt
 */

/**
 * @typedef {Object} UsersCols
 * @property {'mu_id'} id
 * @property {'mu_branch_id'} branch_id
 * @property {'mu_role_id'} role_id
 * @property {'mu_first_name'} first_name
 * @property {'mu_last_name'} last_name
 * @property {'mu_email'} email
 * @property {'mu_username'} username
 * @property {'mu_password'} password
 * @property {'mu_isActive'} isActive
 * @property {'mu_createdAt'} createdAt
 * @property {'mu_updatedAt'} updatedAt
 */

/**
 * @typedef {Object} StoresCols
 * @property {'ms_id'} id
 * @property {'ms_store_name'} store_name
 * @property {'ms_store_code'} store_code
 * @property {'ms_store_address'} store_address
 * @property {'ms_contact_person'} contact_person
 * @property {'ms_contact_number'} contact_number
 * @property {'ms_is_active'} is_active
 */

/**
 * @typedef {Object} PermissionCols
 * @property {'mp_id'} id
 * @property {'mp_role_id'} role_id
 * @property {'mp_module'} module
 * @property {'mp_can_read'} can_read
 * @property {'mp_can_write'} can_write
 * @property {'mp_can_update'} can_update
 * @property {'mp_createdAt'} createdAt
 * @property {'mp_updatedAt'} updatedAt
 */

/**
 * @typedef {Object} VehiclesCols
 * @property {'mv_id'} id
 * @property {'mv_plate_number'} plate_number
 * @property {'mv_vehicleTypeId'} vehicleTypeId
 * @property {'mv_vehicleImage'} vehicleImage
 * @property {'mv_brand'} brand
 * @property {'mv_model'} model
 * @property {'mv_capacity'} capacity
 * @property {'mv_color'} color
 * @property {'mv_fuel_type'} fuel_type
 * @property {'mv_odometer'} odometer
 * @property {'mv_file_number'} file_number
 * @property {'mv_or_number'} or_number
 * @property {'mv_cr_number'} cr_number
 * @property {'mv_registration_expiry'} registration_expiry
 * @property {'mv_remarks'} remarks
 * @property {'mv_status'} status
 * @property {'mv_created_at'} created_at
 * @property {'mv_updated_at'} updated_at
 */

const Master = {
  Role: {
    table: 'master_role',
    pk: 'mr_id',
    prefix: 'mr',
    /** @type {RoleCols} */
    cols: {
      id: 'mr_id',
      role_name: 'mr_role_name',
      description: 'mr_description',
      is_active: 'mr_is_active',
      createdAt: 'mr_createdAt',
      updatedAt: 'mr_updatedAt',
    },
    select: ['mr_id', 'mr_role_name', 'mr_description', 'mr_is_active', 'mr_createdAt', 'mr_updatedAt'],
    insert: ['mr_id', 'mr_role_name', 'mr_description', 'mr_is_active'],
  },
  Branch: {
    table: 'master_branch',
    pk: 'mb_id',
    prefix: 'mb',
    /** @type {BranchCols} */
    cols: {
      id: 'mb_id',
      branch_name: 'mb_branch_name',
      company_name: 'mb_company_name',
      address: 'mb_address',
      email: 'mb_email',
      contact_number: 'mb_contact_number',
      isActive: 'mb_isActive',
      createdAt: 'mb_createdAt',
      updatedAt: 'mb_updatedAt',
    },
    select: ['mb_id', 'mb_branch_name', 'mb_company_name', 'mb_address', 'mb_email', 'mb_contact_number', 'mb_isActive', 'mb_createdAt', 'mb_updatedAt'],
    insert: ['mb_id', 'mb_branch_name', 'mb_company_name', 'mb_address', 'mb_email', 'mb_contact_number'],
  },
  Users: {
    table: 'master_users',
    pk: 'mu_id',
    prefix: 'mu',
    /** @type {UsersCols} */
    cols: {
      id: 'mu_id',
      branch_id: 'mu_branch_id',
      role_id: 'mu_role_id',
      first_name: 'mu_first_name',
      last_name: 'mu_last_name',
      email: 'mu_email',
      username: 'mu_username',
      password: 'mu_password',
      isActive: 'mu_isActive',
      createdAt: 'mu_createdAt',
      updatedAt: 'mu_updatedAt',
    },
    select: ['mu_id', 'mu_branch_id', 'mu_role_id', 'mu_first_name', 'mu_last_name', 'mu_email', 'mu_username', 'mu_password', 'mu_isActive', 'mu_createdAt', 'mu_updatedAt'],
    insert: ['mu_id', 'mu_branch_id', 'mu_role_id', 'mu_first_name', 'mu_last_name', 'mu_email', 'mu_username', 'mu_password'],
  },
  Stores: {
    table: 'master_stores',
    pk: 'ms_id',
    prefix: 'ms',
    /** @type {StoresCols} */
    cols: {
      id: 'ms_id',
      store_name: 'ms_store_name',
      store_code: 'ms_store_code',
      store_address: 'ms_store_address',
      contact_person: 'ms_contact_person',
      contact_number: 'ms_contact_number',
      is_active: 'ms_is_active',
    },
    select: ['ms_id', 'ms_store_name', 'ms_store_code', 'ms_store_address', 'ms_contact_person', 'ms_contact_number', 'ms_is_active'],
    insert: ['ms_id', 'ms_store_name', 'ms_store_code', 'ms_store_address', 'ms_contact_person', 'ms_contact_number', 'ms_is_active'],
  },
  Permission: {
    table: 'master_permission',
    pk: 'mp_id',
    prefix: 'mp',
    /** @type {PermissionCols} */
    cols: {
      id: 'mp_id',
      role_id: 'mp_role_id',
      module: 'mp_module',
      can_read: 'mp_can_read',
      can_write: 'mp_can_write',
      can_update: 'mp_can_update',
      createdAt: 'mp_createdAt',
      updatedAt: 'mp_updatedAt',
    },
    select: ['mp_id', 'mp_role_id', 'mp_module', 'mp_can_read', 'mp_can_write', 'mp_can_update', 'mp_createdAt', 'mp_updatedAt'],
    insert: ['mp_id', 'mp_role_id', 'mp_module', 'mp_can_read', 'mp_can_write', 'mp_can_update'],
  },
  Vehicles: {
    table: 'master_vehicles',
    pk: 'mv_id',
    prefix: 'mv',
    /** @type {VehiclesCols} */
    cols: {
      id: 'mv_id',
      plate_number: 'mv_plate_number',
      vehicleTypeId: 'mv_vehicleTypeId',
      vehicleImage: 'mv_vehicleImage',
      brand: 'mv_brand',
      model: 'mv_model',
      capacity: 'mv_capacity',
      color: 'mv_color',
      fuel_type: 'mv_fuel_type',
      odometer: 'mv_odometer',
      file_number: 'mv_file_number',
      or_number: 'mv_or_number',
      cr_number: 'mv_cr_number',
      registration_expiry: 'mv_registration_expiry',
      remarks: 'mv_remarks',
      status: 'mv_status',
      created_at: 'mv_created_at',
      updated_at: 'mv_updated_at',
    },
    select: ['mv_id', 'mv_plate_number', 'mv_vehicleTypeId', 'mv_vehicleImage', 'mv_brand', 'mv_model', 'mv_capacity', 'mv_color', 'mv_fuel_type', 'mv_odometer', 'mv_file_number', 'mv_or_number', 'mv_cr_number', 'mv_registration_expiry', 'mv_remarks', 'mv_status', 'mv_created_at', 'mv_updated_at'],
    insert: ['mv_id', 'mv_plate_number', 'mv_vehicleTypeId', 'mv_vehicleImage', 'mv_brand', 'mv_model', 'mv_capacity', 'mv_color', 'mv_fuel_type', 'mv_odometer', 'mv_file_number', 'mv_or_number', 'mv_cr_number', 'mv_remarks', 'mv_status'],
  },
};

exports.Master = Master;