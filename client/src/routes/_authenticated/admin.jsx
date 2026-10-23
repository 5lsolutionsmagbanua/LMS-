// src/routes/_authenticated/admin.jsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import PortalLayout from '../../components/layout/PortalLayout'
import { requireRoleAccess } from '../../utils/routeGuards'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: ({ context, location }) => {
    requireRoleAccess(context, location.pathname)
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { user, permissions } = Route.useRouteContext()

  return (
    <PortalLayout user={user} permissions={permissions}>
      <Outlet />
    </PortalLayout>
  )
} 