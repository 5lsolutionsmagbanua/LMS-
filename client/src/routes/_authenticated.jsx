// src/routes/_authenticated.jsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    console.log('[_authenticated beforeLoad]', {
      isLoading: context.isLoading,
      user: context.user,
      path: location.pathname,
    })

    if (context.isLoading) return
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <Outlet />
}
