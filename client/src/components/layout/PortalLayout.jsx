// client/src/components/layout/PortalLayout.jsx
import { useLocation } from '@tanstack/react-router'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Footer from './Footer'
import { usePortalLayout } from '../../hooks/usePortalLayout'
import { useDispatchRealtime } from '../../hooks/useDispatch' // ← add
import { getUserRoles } from '../../utils/roleRouting'
import { hasRoutePermission } from '../../constants/permissionsMap'

export default function PortalLayout({ user, permissions, permissionsLoading, children }) {
  const { pathname } = useLocation()
  useDispatchRealtime() // ← add: live refresh of dispatch-related queries (no-op while socket is null)

  const {
    sidebarOpen,
    setSidebarOpen,
    isPortalModalOpen,
    setIsPortalModalOpen,
    allowedPortals,
    activePortal,
    handlePortalChange,
  } = usePortalLayout(user)

  const primaryRole = getUserRoles(user)[0] || 'user'
  const canAccessRoute = permissionsLoading
    ? true // don't flash "Not authorized" while the matrix is still loading
    : hasRoutePermission(primaryRole, permissions, pathname)

  return (
    <div className="relative isolate flex min-h-screen flex-col">
      {/* Liquid backdrop: gives the glass sidebar/topbar something to refract.
          Fully theme-driven via the `primary` token + dark: variants. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-50 via-primary/5 to-slate-100 dark:from-slate-950 dark:via-primary/10 dark:to-slate-900"
      >
        <div className="liquid-blob-a absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-primary/25 blur-3xl dark:bg-primary/20" />
        <div className="liquid-blob-b absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl dark:bg-primary/15" />
        <div className="liquid-blob-a absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/10" />
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((v) => !v)}
        activePortal={activePortal}
        userPermissions={permissions}
      />

      <div
        className={`flex min-h-screen flex-col transition-[margin] duration-200 ease-out ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-0'
        }`}
      >
        <Topbar
          onMenuClick={() => setSidebarOpen((v) => !v)}
          activePortal={activePortal}
          onPortalChange={handlePortalChange}
          availablePortals={allowedPortals}
          user={user}
          isPortalModalOpen={isPortalModalOpen}
          setIsPortalModalOpen={setIsPortalModalOpen}
        />

        <main className="max-w-8xl mx-auto w-full flex-1 p-6">
          {permissionsLoading ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-white/50 px-4 py-3 text-sm text-slate-500 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              Loading…
            </div>
          ) : canAccessRoute ? (
            children
          ) : (
            <div className="rounded-3xl border border-white/50 bg-white/60 p-6 shadow-[0_20px_60px_-15px_rgb(0_0_0/0.25),inset_0_1px_0_rgb(255_255_255/0.7)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/50 dark:shadow-[0_20px_60px_-15px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.08)]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Not authorized</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                You don't have permission to view this page.
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}
