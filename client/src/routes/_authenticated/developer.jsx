// src/routes/_authenticated/developer.jsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import PortalLayout from '../../components/layout/PortalLayout'
import { requireRoleAccess } from '../../utils/routeGuards'

export const Route = createFileRoute('/_authenticated/developer')({
  beforeLoad: ({ context, location }) => {
    requireRoleAccess(context, location.pathname)
  },
  component: DeveloperLayout,
})

function DeveloperLayout() {
  const { user, permissions } = Route.useRouteContext()

  return (
    <PortalLayout user={user} permissions={permissions}>
      <Outlet />
    </PortalLayout>
  )
}
