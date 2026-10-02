const session = require('express-session')
const MongoStore = require('connect-mongo')
require('dotenv').config()
const { SESSION_COOKIE_NAME, COOKIE_BASE } = require('../utilities/session.constants')

// Fail loudly at startup instead of returning mysterious 500s later.
if (!process.env.MONGODB_URL || !process.env.SESSION_SECRET) {
  throw new Error('MONGODB_URL and SESSION_SECRET must be set in the server .env file')
}

const options = {
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    collectionName: process.env.SESSION_COLLECTION || 'sessions',
  }),
  name: SESSION_COOKIE_NAME,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    ...COOKIE_BASE,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}

const initSession = (app) => {
  app.use(session(options))
}

module.exports = { initSession }