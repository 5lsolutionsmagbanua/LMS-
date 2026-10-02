const SESSION_COOKIE_NAME = 'app.sid'

// The browser only deletes a cookie when name, path and these options match how it was set.
const COOKIE_BASE = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: false, // local http; set true behind https in production
}

module.exports = { SESSION_COOKIE_NAME, COOKIE_BASE }