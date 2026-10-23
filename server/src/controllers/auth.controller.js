const jwt = require('jsonwebtoken')
const { SQLQueryBuilder, Query } = require('../database/utilities/queries.util.js')
const { Master } = require('../database/models/Master')
const { EncryptString } = require('../utilities/cryptography.util')
const { SESSION_COOKIE_NAME, COOKIE_BASE } = require('../utilities/session.constants')
const { markOnline, markOffline } = require('../services/live-location.service')

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
    console.table([
      {
        Action: 'LOGIN_ATTEMPT',
        Username: username || 'N/A',
        Status: 'FAILED',
        Reason: 'Missing credentials',
      },
    ])
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
      console.table([
        {
          Action: 'LOGIN_ATTEMPT',
          Username: username,
          Status: 'FAILED',
          Reason: 'Invalid credentials or inactive user',
        },
      ])
      return res.status(401).json({ message: 'Invalid username or password.' })
    }

    // Fresh session ID on every login (prevents session fixation).
    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error('Session regenerate error:', regenErr)
        console.table([
          {
            Action: 'SESSION_REGENERATE',
            Username: username,
            Status: 'ERROR',
            Details: regenErr.message,
          },
        ])
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
          console.table([
            {
              Action: 'SESSION_SAVE',
              Username: username,
              Status: 'ERROR',
              Details: saveErr.message,
            },
          ])
          return res.status(500).json({ status: false, message: 'Error saving session' })
        }

        // Session is stored: the user is now online for live-location presence.
        markOnline(String(result.userId))

        console.table([
          {
            Action: 'LOGIN_SUCCESS',
            UserId: result.userId,
            Username: result.userName,
            Role: result.roleName,
            Branch: result.branchName,
          },
        ])

        return res.json(result)
      })
    })
  } catch (error) {
    console.error(error)
    console.table([
      { Action: 'LOGIN_EXCEPTION', Username: username, Status: 'ERROR', Details: error.message },
    ])
    return res.status(500).json({ status: false, message: 'Error Logging In' })
  }
}

/**
 * @name Logout
 * @description Marks the user offline, destroys the session, and clears the cookie.
 */
const Logout = (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Logout user'

  // Read the id before the session is destroyed, so presence can be cleared.
  const signedOutUserId = req.session?.userId
  if (signedOutUserId) markOffline(String(signedOutUserId))

  const userId = signedOutUserId || 'Unknown'

  req.session.destroy((err) => {
    if (err) {
      console.error('Cannot destroy session', err)
      console.table([{ Action: 'LOGOUT', UserId: userId, Status: 'FAILED', Details: err.message }])
      return res.status(500).json({ message: 'Logout failed' })
    }

    console.table([{ Action: 'LOGOUT_SUCCESS', UserId: userId, Status: 'SUCCESS' }])
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
    console.table([
      { Action: 'ME_CHECK', Status: 'UNAUTHORIZED', Reason: 'No session userId found' },
    ])
    return res.status(401).json({ message: 'Not logged in' })
  }

  try {
    const { sql, bindings } = selectUserBase()
      .where(Master.Users.pk, userId)
      .where(Master.Users.cols.isActive, true)
      .build()

    const [result] = await Query(sql, bindings)

    if (!result) {
      // Deactivated or deleted since login: end the session, clear presence, drop the cookie.
      markOffline(String(userId))
      console.table([
        {
          Action: 'ME_CHECK',
          UserId: userId,
          Status: 'DEACTIVATED_OR_DELETED',
          Reason: 'User no longer active or exists',
        },
      ])
      return req.session.destroy(() => {
        res.clearCookie(SESSION_COOKIE_NAME, COOKIE_BASE)
        res.status(401).json({ message: 'Not logged in' })
      })
    }

    console.table([
      {
        Action: 'ME_FETCH_SUCCESS',
        UserId: result.userId,
        Username: result.userName,
        Role: result.roleName,
      },
    ])
    return res.json(result)
  } catch (error) {
    console.error(error)
    console.table([
      { Action: 'ME_EXCEPTION', UserId: userId, Status: 'ERROR', Details: error.message },
    ])
    return res.status(500).json({ message: 'Could not load your account' })
  }
}

/**
 * @name getWsToken
 * @description Short-lived JWT used only for the WebSocket handshake.
 *              Auth stays session-based; this just bridges it to the WS server.
 */
const getWsToken = (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Short-lived token for the WebSocket handshake'
  const userId = req.session?.userId
  if (!userId) return res.status(401).json({ message: 'Not logged in' })

  if (!process.env.JWT_SECRET) {
    console.error('getWsToken: JWT_SECRET is not set')
    return res.status(500).json({ message: 'Realtime is not configured' })
  }

  const token = jwt.sign(
    {
      userId,
      role: req.session.roleName,
      branchId: req.session.branchId,
    },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '60s' },
  )

  return res.json({ token })
}

module.exports = {
  login,
  Logout,
  me,
  getWsToken,
}
