import React, { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { useAuthContext } from './hooks/useAuth'
import { WebSocketProvider } from './context/WebSocketContext'

import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  context: {
    queryClient,
    user: null,
    permissions: [],
    isLoading: true,
  },
  defaultPreload: 'intent',
})

const FullPageLoader = () => (
  <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
    {/* swap for your real spinner/splash */}
    <span>Loading...</span>
  </div>
)

const InnerApp = () => {
  const { user, permissions, isLoading } = useAuthContext()

  useEffect(() => {
    router.update({
      context: {
        ...router.options.context,
        user,
        permissions,
        isLoading,
      },
    })
    router.invalidate()
  }, [user, permissions, isLoading])

  // 🔑 Don't let the router match/guard any route until the initial
  // session check has actually resolved — otherwise beforeLoad guards
  // run against the placeholder `user: null` and bounce you to /login
  // on every hard refresh, even when the session is valid.
  if (isLoading) {
    return <FullPageLoader />
  }

  return <RouterProvider router={router} />
}

const rootElement = document.getElementById('root')

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <WebSocketProvider>
              <InnerApp />
            </WebSocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}
