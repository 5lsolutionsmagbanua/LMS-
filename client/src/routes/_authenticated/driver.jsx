// src/routes/_authenticated/driver.jsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import PortalLayout from '../../components/layout/PortalLayout'
import { requireRoleAccess } from '../../utils/routeGuards'

export const Route = createFileRoute('/_authenticated/driver')({
  beforeLoad: ({ context, location }) => {
    requireRoleAccess(context, location.pathname)
  },
  component: DriverLayout,
})

function DriverLayout() {
  const { user, permissions } = Route.useRouteContext()

  return (
    <PortalLayout user={user} permissions={permissions}>
      <Outlet />
    </PortalLayout>
  )
}
