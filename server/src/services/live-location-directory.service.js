const { SQLQueryBuilder, Query } = require('../database/utilities/queries.util')
const { Master } = require('../database/models/Master')

const SQL = new SQLQueryBuilder()
const DIRECTORY_TTL_MS = 60 * 1000

let cache = { users: [], loadedAt: 0 }
let loading = null

// Loads active users and roles once per TTL, not on every poll
const loadDirectory = async () => {
  const { sql, bindings } = SQL.model(Master.Users)
    .select([
      { col: Master.Users.cols.id, as: 'id' },
      { col: Master.Users.cols.first_name, as: 'firstName' },
      { col: Master.Users.cols.last_name, as: 'lastName' },
      { col: Master.Users.cols.branch_id, as: 'branchId' },
      { col: Master.Role.cols.role_name, as: 'roleName' },
    ])
    .join(Master.Role.table, Master.Users.cols.role_id, Master.Role.pk)
    .where(Master.Users.cols.isActive, true)
    .build()

  const rows = (await Query(sql, bindings)) || []
  return rows.map((r) => ({
    userId: String(r.id),
    name: `${r.firstName} ${r.lastName}`.trim(),
    role: r.roleName,
    branchId: r.branchId,
  }))
}

// Concurrent callers share one in-flight query instead of each running their own
const getDirectory = async () => {
  if (Date.now() - cache.loadedAt < DIRECTORY_TTL_MS) return cache.users
  if (!loading) {
    loading = loadDirectory()
      .then((users) => {
        cache = { users, loadedAt: Date.now() }
        return users
      })
      .finally(() => {
        loading = null
      })
  }
  return loading
}

// Forces the next read to hit the database, e.g. after a user is created or edited
const invalidateDirectory = () => {
  cache.loadedAt = 0
}

module.exports = { getDirectory, invalidateDirectory }
