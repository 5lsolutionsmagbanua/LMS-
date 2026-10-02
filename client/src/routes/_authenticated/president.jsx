// src/routes/_authenticated/manager.jsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import PortalLayout from '../../components/layout/PortalLayout'
import { requireRoleAccess } from '../../utils/routeGuards'

export const Route = createFileRoute('/_authenticated/president')({
  beforeLoad: ({ context, location }) => {
    requireRoleAccess(context, location.pathname)
  },
  component: PresidentLayout,
})

function PresidentLayout() {
  const { user, permissions } = Route.useRouteContext()

  return (
    <PortalLayout user={user} permissions={permissions}>
      <Outlet />
    </PortalLayout>
  )
}