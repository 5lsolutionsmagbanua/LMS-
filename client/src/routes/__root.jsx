import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import NotFound from '../components/ui/NotFound'
// Optional: Import devtools for a better developer experience
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const Route = createRootRouteWithContext()({
  component: RootComponent,
  notFoundComponent: NotFound,
})

// The old top-level nav was removed here: /login renders its own
// standalone screen and /dashboard renders its own sidebar/topbar/footer,
// so a shared nav bar above both would just be redundant chrome. If you
// add public marketing pages later, reintroduce a nav scoped to those
// routes only (e.g. a pathless layout route), not back in the root.
function RootComponent() {
  return <Outlet />
}
