'use strict'
require('dotenv').config()
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs/promises')

const { logger } = require('../utilities/logger.util')
const { SQLQueryBuilder, Query } = require('../database/utilities/queries.util')
const { Master } = require('../database/models/Master')
const { roleCan } = require('../services/permission.service')
const { ACTIONS } = require('../database/constants/permissions')
const { SESSION_COOKIE_NAME, COOKIE_BASE } = require('../utilities/session.constants')

const SQL = new SQLQueryBuilder()

const wantsHtml = (req) => req.accepts(['json', 'html']) === 'html'

const sendErrorResponse = async (req, res, statusCode, viewName, defaultMessage) => {
  res.status(statusCode)
  const message = res.locals.errorMessage || defaultMessage

  if (wantsHtml(req)) {
    try {
      const filePath = path.join(__dirname, '..', 'views', viewName)
      const htmlData = await fs.readFile(filePath, 'utf8')
      return res.send(htmlData.replace('{{ERROR_MESSAGE}}', message))
    } catch (err) {
      return res.send(`<h1>Access Denied</h1><p>${message}</p>`)
    }
  }

  return res.json({ message })
}

const handleUnauthorized = (req, res, message = 'Please sign in to continue.') => {
  res.locals.errorMessage = message
  return sendErrorResponse(req, res, 401, '401.html', message)
}

const handleForbidden = (
  req,
  res,
  message = 'Sorry, you are not authorized to access this page.',
) => {
  res.locals.errorMessage = message
  return sendErrorResponse(req, res, 403, '403.html', message)
}

/**
 * @name auth
 * @description Enforces standard session cookie checks for authentication.
 */
const auth = async (req, res, next) => {
  try {
    console.log('=== AUTH DEBUG ===')
    console.log('VITE_ENV:', process.env.VITE_ENV)
    console.log('SWAGGER_TOKEN env:', process.env.SWAGGER_TOKEN)
    console.log('x-swagger-token header:', req.headers['x-swagger-token'])
    console.log('Token match:', req.headers['x-swagger-token'] === process.env.SWAGGER_TOKEN)
    console.log('==================')
    // Dev-only Swagger bypass — loads a real user so requirePermission also works
    if (
      process.env.VITE_ENV !== 'production' &&
      req.headers['x-swagger-token'] === process.env.SWAGGER_TOKEN
    ) {
      const { sql, bindings } = SQL.model(Master.Users)
        .select([
          { col: Master.Users.cols.id, as: 'id' },
          { col: Master.Users.cols.username, as: 'username' },
          { col: Master.Users.cols.first_name, as: 'firstName' },
          { col: Master.Users.cols.last_name, as: 'lastName' },
          { col: Master.Users.cols.branch_id, as: 'branchId' },
          { col: Master.Users.cols.role_id, as: 'roleId' },
          { col: Master.Role.cols.role_name, as: 'roleName' },
        ])
        .join(Master.Role.table, Master.Users.cols.role_id, Master.Role.pk)
        .where(Master.Users.cols.username, process.env.SWAGGER_USER || 'admin')
        .where(Master.Users.cols.isActive, true)
        .limit(1)
        .build()

      const [result] = await Query(sql, bindings)
      if (result) {
        req.user = result
        return next()
      }
    }

    const userId = req.session?.userId
    if (!userId) {
      return handleUnauthorized(req, res)
    }

    const { sql, bindings } = SQL.model(Master.Users)
      .select([
        { col: Master.Users.cols.id, as: 'id' },
        { col: Master.Users.cols.username, as: 'username' },
        { col: Master.Users.cols.first_name, as: 'firstName' },
        { col: Master.Users.cols.last_name, as: 'lastName' },
        { col: Master.Users.cols.branch_id, as: 'branchId' },
        { col: Master.Users.cols.role_id, as: 'roleId' },
        { col: Master.Role.cols.role_name, as: 'roleName' },
      ])
      .join(Master.Role.table, Master.Users.cols.role_id, Master.Role.pk)
      .where(Master.Users.pk, userId)
      .where(Master.Users.cols.isActive, true)
      .limit(1)
      .build()

    const [result] = await Query(sql, bindings)

    if (!result) {
      req.session?.destroy?.(() => {})
      res.clearCookie(SESSION_COOKIE_NAME, COOKIE_BASE)
      return handleUnauthorized(req, res, 'Your account is no longer active.')
    }

    req.user = result
    return next()
  } catch (err) {
    logger.error('Authentication check failed', err)
    return handleUnauthorized(req, res, 'Could not verify your session.')
  }
}

/**
 * @name requireRole
 * @description Hard gate by role name. Admins bypass all role checks automatically.
 */
const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    const roleName = req.user?.roleName

    if (!roleName) {
      return handleUnauthorized(req, res)
    }

    if (roleName === 'Admin' || allowedRoles.includes(roleName)) {
      return next()
    }

    logger.warn(`Role gate blocked ${roleName} on ${req.method} ${req.originalUrl}`)
    return handleForbidden(req, res, 'Your role does not have access to this area.')
  }

/**
 * @name requirePermission
 * @description Checks one module/action pair against permissions. Admins bypass permission checks automatically.
 */
const requirePermission = (moduleKey, action) => async (req, res, next) => {
  try {
    const roleId = req.user?.roleId
    const roleName = req.user?.roleName

    if (!roleId) {
      return handleUnauthorized(req, res)
    }

    if (roleName === 'Admin') {
      return next()
    }

    const allowed = await roleCan(roleId, moduleKey, action)

    if (!allowed) {
      logger.warn(
        `Permission denied: role ${roleName} lacks ${action} on ${moduleKey} (${req.method} ${req.originalUrl})`,
      )
      return handleForbidden(req, res, `You do not have permission to ${action} ${moduleKey}.`)
    }

    return next()
  } catch (err) {
    logger.error('Permission check failed', err)
    return handleForbidden(req, res, 'Could not verify your permissions.')
  }
}

/**
 * @name requireUpsertPermission
 * @description Automatically maps create vs update actions for master routes.
 */
const requireUpsertPermission = (moduleKey) => (req, res, next) => {
  const action = req.body?.id ? ACTIONS.UPDATE : ACTIONS.WRITE
  return requirePermission(moduleKey, action)(req, res, next)
}

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many OTP requests, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  auth,
  requireRole,
  requirePermission,
  requireUpsertPermission,
  otpLimiter,
  handleUnauthorized,
  handleForbidden,
}
