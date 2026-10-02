const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const env = require('./src/database/config/env')
const cors = require('cors')
const express = require('express')

const { logger } = require('./src/utilities/logger.util')
const { initStaticFiles } = require('./src/startup/staticFiles.startup')
const { initSession } = require('./src/startup/session.startup')
const { httpLogger } = require('./src/middlewares/logger.middleware')
const { initRoutes } = require('./src/startup/routes.startup')
const { initWebSocket } = require('./src/startup/socket.startup')
const { initDocs } = require('./src/startup/docs.startup')

const { checkConnection } = require('./src/database/utilities/queries.util')
const { corsOptions } = require('./src/middlewares/corsOptions.middleware')

const app = express()

const serverStart = async () => {
  try {
    logger.info('--------------------Server Starting--------------------')
    logger.info(`Server running on ${env.VITE_ENV.toUpperCase()} mode`)

    if (env._warnings && env._warnings.length > 0) {
      env._warnings.forEach((warningMsg) => {
        logger.warn(`Environment Warning: ${warningMsg}`)
      })
    }

    logger.info('Adding req body json parser')
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ limit: '50mb', extended: true }))
    // Catch malformed JSON bodies gracefully instead of letting body-parser throw uncaught
    app.use((err, req, res, next) => {
      if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
        logger.warn(`Malformed JSON body from ${req.ip} on ${req.originalUrl}`)
        return res.status(400).json({ message: 'Invalid JSON body' })
      }
      next(err)
    })
    app.use(express.static(path.join(__dirname, 'public')))

    logger.info('Adding logger middleware')
    app.use(httpLogger)

    logger.info('Adding cors middleware')
    app.use(cors(corsOptions))

    logger.info('Stablishing database connection.....')
    const connection = await checkConnection()
    logger.info(`Status: ${connection.status}, Latency: ${connection.latency} ms`)

    // Trust proxy must be set before session initialization when behind reverse proxies / local setups
    logger.info('Initializing session')
    app.set('trust proxy', 1)
    initSession(app)

    logger.info('Initializing routes')
    initRoutes(app)

    logger.info('Initializing docs')
    await initDocs(app)

    logger.info('Serving static files')
    initStaticFiles(app)

    const server = app.listen(env.VITE_SERVER_API_PORT, () => {
      logger.info(`Server listening on port http://${env.SERVER_HOST}:${env.VITE_SERVER_API_PORT}`)
    })

    logger.info('Initializing WebSockets')
    initWebSocket(server)

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received, Closing the application ')
      server.close()
      logger.info('--------------------Server Closed----------------------')
      process.exit(0)
    })
  } catch (err) {
    logger.error('FATAL: Failed to start server due to database error.', err)
    process.exit(1)
  }
}

serverStart()
