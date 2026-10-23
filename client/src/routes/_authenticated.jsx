import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import LiveLocationSharePrompt from '../components/layout/LiveLocationSharePrompt'
import { useAuthContext } from '../hooks/useAuth'
import { useLiveLocationHeartbeat } from '../hooks/useLiveLocationHeartbeat'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
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
  const { user } = useAuthContext()
  useLiveLocationHeartbeat(Boolean(user))

  return (
    <>
      <Outlet />
      <LiveLocationSharePrompt />
    </>
  )
}