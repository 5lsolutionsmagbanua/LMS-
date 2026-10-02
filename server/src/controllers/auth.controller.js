const { SQLQueryBuilder } = require('../database/utilities/queries.util.js')
const { Query } = require('../database/utilities/queries.util.js')
const { Master } = require('../database/models/Master')
const { EncryptString } = require('../utilities/cryptography.util')
const { SESSION_COOKIE_NAME, COOKIE_BASE } = require('../utilities/session.constants')
const SQL = new SQLQueryBuilder()

// One query, used by both login and me, so they always return the same shape.
const selectUserBase = () =>
  SQL.model(Master.Users)
    .select([
      { col: Master.Users.cols.id, as: 'userId' },
      { col: Master.Users.cols.username, as: 'userName' },
      { col: Master.Users.cols.first_name, as: 'firstName' },
      { col: Master.Users.cols.last_name, as: 'lastName' },
      { col: Master.Users.cols.branch_id, as: 'branchId' },
      { col: Master.Branch.cols.branch_name, as: 'branchName' },
      { col: Master.Users.cols.role_id, as: 'roleId' },
      { col: Master.Role.cols.role_name, as: 'roleName' },
    ])
    .join(Master.Role.table, Master.Users.cols.role_id, Master.Role.pk)
    .join(Master.Branch.table, Master.Users.cols.branch_id, Master.Branch.pk)

const login = async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Login to get a session token'
  // #swagger.autoBody = false
  // #swagger.consumes = ['application/x-www-form-urlencoded']
  /* #swagger.parameters['username'] = {
        in: 'formData',
        type: 'string',
        required: true,
        description: 'Your username'
     }

     #swagger.parameters['password'] = {
        in: 'formData',
        type: 'string',
        required: true,
        description: 'Your password',
        format: 'password'
     }
  */
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({
      status: false,
      message: 'Username and password are required.',
    })
  }

  try {
    const { sql, bindings } = selectUserBase()
      .where(Master.Users.cols.username, username)
      .where(Master.Users.cols.password, EncryptString(password))
      .where(Master.Users.cols.isActive, true)
      .build()

    const [result] = await Query(sql, bindings)

    if (!result) {
      return res.status(401).json({ message: 'Invalid username or password.' })
    }

    // Fresh session ID on every login (prevents session fixation).
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error('Session regenerate error:', regenErr)
        return res.status(500).json({ status: false, message: 'Error creating session' })
      }

      req.session.userId = result.userId
      req.session.userName = result.userName
      req.session.firstName = result.firstName
      req.session.lastName = result.lastName
      req.session.branchId = result.branchId
      req.session.branchName = result.branchName
      req.session.roleId = result.roleId
      req.session.roleName = result.roleName

      // Force the session into the store before responding.
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr)
          return res.status(500).json({ status: false, message: 'Error saving session' })
        }
        return res.json(result)
      })
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ status: false, message: 'Error Logging In' })
  }
}

/**
 * @name Logout
 * @description Delete the session from MongoDB and clear the cookie.
 */
const Logout = (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Logout user'

  req.session.destroy((err) => {
    if (err) {
      console.error('Cannot destroy session', err)
      return res.status(500).json({ message: 'Logout failed' })
    }

    res.clearCookie(SESSION_COOKIE_NAME, COOKIE_BASE)
    return res.sendStatus(204)
  })
}

/**
 * @name me
 * @description Current user, read fresh from the database so a role change or
 *              deactivation shows up immediately, matching what `auth` enforces.
 */
const me = async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Get the currently logged-in user'

  const userId = req.session?.userId
  if (!userId) {
    return res.status(401).json({ message: 'Not logged in' })
  }

  try {
    const { sql, bindings } = selectUserBase()
      .where(Master.Users.pk, userId)
      .where(Master.Users.cols.isActive, true)
      .build()

    const [result] = await Query(sql, bindings)

    if (!result) {
      // Deactivated or deleted since login: end the session and drop the cookie.
      return req.session.destroy(() => {
        res.clearCookie(SESSION_COOKIE_NAME, COOKIE_BASE)
        res.status(401).json({ message: 'Not logged in' })
      })
    }

    return res.json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Could not load your account' })
  }
}

module.exports = {
  login,
  Logout,
  me,
}
