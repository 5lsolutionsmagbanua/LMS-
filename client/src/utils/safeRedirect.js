// client/src/utils/safeRedirect.js

/**
 * Only allow same-origin, in-app paths.
 * Blocks protocol-relative URLs (//evil.com), backslash tricks (/\evil.com),
 * and redirect loops back to /login.
 */
export const isSafeRedirect = (path) =>
  typeof path === 'string' &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !path.includes('\\') &&
  !path.startsWith('/login')