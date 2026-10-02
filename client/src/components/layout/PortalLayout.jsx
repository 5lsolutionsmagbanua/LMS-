// client/src/components/layout/PortalLayout.jsx
import { useLocation } from '@tanstack/react-router'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Footer from './Footer'
import { usePortalLayout } from '../../hooks/usePortalLayout'
import { getUserRoles } from '../../utils/roleRouting'
import { hasRoutePermission } from '../../constants/permissionsMap'

export default function PortalLayout({ user, permissions, permissionsLoading, children }) {
  const { pathname } = useLocation()
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((v) => !v)}
        activePortal={activePortal}
        userPermissions={permissions}
      />

      <div
        className={`flex flex-col min-h-screen transition-[margin] duration-200 ease-out ${
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

        <main className="flex-1 p-6 w-full max-w-8xl mx-auto">
          {permissionsLoading ? (
            <div className="p-6 text-sm text-slate-400">Loading…</div>
          ) : canAccessRoute ? (
            children
          ) : (
            <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Not authorized</h2>
              <p className="text-sm text-slate-500 mt-1">
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
