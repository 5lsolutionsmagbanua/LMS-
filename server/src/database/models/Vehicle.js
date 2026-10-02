/**
 * ⚠️ AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 */

/**
 * @typedef {Object} TypesCols
 * @property {'vt_id'} id
 * @property {'vt_name'} name
 * @property {'vt_description'} description
 * @property {'vt_isActive'} isActive
 * @property {'vt_created_at'} created_at
 * @property {'vt_updated_at'} updated_at
 */

const Vehicle = {
  Types: {
    table: 'vehicle_types',
    pk: 'vt_id',
    prefix: 'vt',
    /** @type {TypesCols} */
    cols: {
      id: 'vt_id',
      name: 'vt_name',
      description: 'vt_description',
      isActive: 'vt_isActive',
      created_at: 'vt_created_at',
      updated_at: 'vt_updated_at',
    },
    select: ['vt_id', 'vt_name', 'vt_description', 'vt_isActive', 'vt_created_at', 'vt_updated_at'],
    insert: ['vt_id', 'vt_name', 'vt_description'],
  },
};

exports.Vehicle = Vehicle;