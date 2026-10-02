// client/src/hooks/usePortalLayout.js
import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { PORTAL_MODULES, getPortalForPath } from '../components/layout/portalConfig'
import { getUserRoles, isSuperUserRole, getLandingPortalForUser } from '../utils/roleRouting'

/**
 * Shared state/behavior for the four portal shell routes (admin, developer,
 * manager, driver). Each route still owns its own `beforeLoad` guard and
 * `requireRoleAccess` call — that's the real security boundary. This hook
 * only handles what's common to the shell once a user is known to be
 * allowed in: sidebar toggle, which portals show in the switcher, which
 * portal is "active" right now, and switching between them.
 *
 * `activePortal` is derived from the current URL (via getPortalForPath),
 * not tracked as separate state, so the topbar and sidebar always match
 * the URL however you got there. When the URL isn't inside any portal
 * (for example a not-found page), it falls back to the user's own home
 * portal rather than the first entry in PORTAL_MODULES, which is always
 * "Developer".
 */
export function usePortalLayout(user) {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  )
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const userRoleKeys = useMemo(() => getUserRoles(user), [user])
  const isSuperUser = useMemo(() => isSuperUserRole(userRoleKeys), [userRoleKeys])

  const allowedPortals = useMemo(() => {
    if (isSuperUser) return PORTAL_MODULES

    return PORTAL_MODULES.filter((module) => {
      if (!module.allowedRoles) return true
      const allowedLower = module.allowedRoles.map((r) => r.toLowerCase().trim())
      return userRoleKeys.some((r) => allowedLower.includes(r))
    })
  }, [userRoleKeys, isSuperUser])

  const activePortal = useMemo(() => {
    const fromPath = getPortalForPath(location.pathname)
    if (fromPath) return fromPath

    const home = getLandingPortalForUser(user)
    return allowedPortals.find((p) => p.path === home) ?? allowedPortals[0] ?? PORTAL_MODULES[0]
  }, [location.pathname, allowedPortals, user])

  const handlePortalChange = (module) => {
    if (!isSuperUser && module.allowedRoles) {
      const allowedLower = module.allowedRoles.map((r) => r.toLowerCase().trim())
      const hasAccess = userRoleKeys.some((r) => allowedLower.includes(r))

      if (!hasAccess) {
        console.warn(
          `Unauthorized role (${userRoleKeys.join(', ')}) attempt to access portal:`,
          module.name,
        )
        return
      }
    }

    // Navigating changes the URL, and activePortal re-derives itself from
    // the new pathname, which also triggers the destination's own
    // beforeLoad/requireRoleAccess check.
    if (module.path) {
      navigate({ to: module.path })
    }
  }

  return {
    sidebarOpen,
    setSidebarOpen,
    isPortalModalOpen,
    setIsPortalModalOpen,
    userRoleKeys,
    isSuperUser,
    allowedPortals,
    activePortal,
    handlePortalChange,
  }
}