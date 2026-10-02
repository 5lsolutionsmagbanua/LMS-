import { redirect } from '@tanstack/react-router'
import { hasRoutePermission } from '../constants/permissionsMap'
import { getLandingPortalForUser, getUserRoles } from './roleRouting'

export const requireRoleAccess = (context, path) => {
  const user = context?.user
  const permissions = context?.permissions
  const isLoading = context?.isLoading

  // 🔑 Auth state hasn't resolved yet — don't judge permissions against
  // an empty/placeholder context. Let the route render; main.jsx now
  // withholds RouterProvider until isLoading is false, so in practice
  // this branch should rarely fire on a hard refresh anymore. It's kept
  // as defense-in-depth for any beforeLoad call that runs during a
  // client-side refetch (e.g. right after login, before permissions
  // finish prefetching).
  if (isLoading) {
    return
  }

  // No user after loading has actually finished → genuinely unauthenticated.
  if (!user) {
    throw redirect({
      to: '/login',
      search: { redirect: path },
    })
  }

  const userRoles = getUserRoles(user)
  const roleName = userRoles[0] || 'user'

  const hasPermission = hasRoutePermission(roleName, permissions, path)

  if (!hasPermission) {
    const fallback = getLandingPortalForUser(user)
    const alreadyThere = path === fallback || path.startsWith(fallback + '/')

    throw redirect({
      to: alreadyThere ? '/unauthorized' : fallback,
      search: { notice: 'forbidden' },
    })
  }
}
