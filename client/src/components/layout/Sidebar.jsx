// client/src/components/layout/Sidebar.jsx
import { Link } from '@tanstack/react-router'
import { useAuthContext } from '../../hooks/useAuth'
import { getUserRoles, isSuperUserRole, getLandingPortalForUser } from '../../utils/roleRouting'
import { ROUTE_MODULE_MAP } from '../../constants/permissionsMap'

// All possible nav items. The permission matrix decides what actually shows.
const ALL_NAV_ITEMS = [
  { label: 'Stock Requests', suffix: '/pending-requests', icon: InboxIcon },
  { label: 'Branches', suffix: '/branches', icon: BuildingIcon },
  { label: 'Stores', suffix: '/stores', icon: StoreIcon },
  { label: 'Users', suffix: '/users', icon: UsersIcon },
  { label: 'Roles', suffix: '/roles', icon: ShieldIcon },
  { label: 'Vehicles', suffix: '/vehicles', icon: TruckIcon },
  { label: 'Vehicle Types', suffix: '/vehicle-types', icon: TruckIcon },
  { label: 'Access Control', suffix: '/permissions', icon: KeyIcon },
]

// Module screens only exist under /admin right now, so every module link
// points there. Change this (or use activePortal.path) once per-portal
// route files exist under developer/, manager/ and driver/.
const MODULE_BASE = '/admin'

function normalizePermissions(rawPermissions) {
  if (!rawPermissions) return {}
  if (!Array.isArray(rawPermissions)) return rawPermissions

  const normalized = {}
  rawPermissions.forEach((p) => {
    const mod = p.module || p.module_name || p.name
    if (mod) {
      normalized[mod] = {
        read: Boolean(p.read ?? p.can_read ?? p.is_read ?? false),
        write: Boolean(p.write ?? p.can_write ?? p.is_write ?? false),
        update: Boolean(p.update ?? p.can_update ?? p.is_update ?? false),
        delete: Boolean(p.delete ?? p.can_delete ?? p.is_delete ?? false),
      }
    }
  })
  return normalized
}

export default function Sidebar({ isOpen, onClose, onToggle, activePortal }) {
  // Same source the router guards use, so nav and access never disagree.
  const { user, permissions } = useAuthContext()

  const userRoles = getUserRoles(user)
  const isSuperUser = isSuperUserRole(userRoles)
  const matrix = normalizePermissions(permissions)
  const homePath = getLandingPortalForUser(user)

  const visibleItems = [
    // Dashboard is always first and always visible. Super users follow the
    // portal they're viewing; everyone else goes to their own home.
    {
      label: 'Dashboard',
      to: isSuperUser ? (activePortal?.path ?? homePath) : homePath,
      icon: GridIcon,
    },

    ...ALL_NAV_ITEMS.filter((item) => {
      const cfg = ROUTE_MODULE_MAP[item.suffix]
      if (!cfg) return false
      if (isSuperUser) return true
      return Boolean(matrix?.[cfg.module]?.[cfg.action])
    }).map((item) => ({
      ...item,
      to: `${MODULE_BASE}${item.suffix}`,
    })),
  ]

  // Non-super users see their own role in the header, not whichever shared
  // portal the URL happens to sit under.
  const headerLabel = isSuperUser
    ? activePortal?.name
    : user?.roleName
      ? `${user.roleName} Portal`
      : activePortal?.name

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm transition-opacity md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex min-h-screen w-64 shrink-0 transform flex-col border-r border-slate-800/80 bg-slate-900/95 text-slate-300 backdrop-blur-md transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/20 text-sm font-black tracking-wider text-primary shadow-inner">
              L
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide text-white leading-tight">LMS</span>
              {headerLabel && (
                <span className="text-[10px] font-medium text-slate-400 leading-tight">
                  {headerLabel}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white md:hidden"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-6">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-slate-800/50 hover:text-slate-100 [&.active]:bg-primary [&.active]:font-semibold [&.active]:text-white [&.active]:shadow-lg [&.active]:shadow-primary/25"
            >
              <item.icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/20 px-6 py-4 text-xs text-slate-500">
          <span>Version</span>
          <span className="rounded border border-slate-700/50 bg-slate-800/60 px-2 py-0.5 font-mono text-slate-400">
            v1.0.0
          </span>
        </div>
      </aside>

      {/* Edge toggle handle — desktop only */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        style={{ left: isOpen ? '16rem' : '0px' }}
        className="fixed top-1/2 z-40 hidden h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900 text-slate-300 shadow-lg transition-[left] duration-300 ease-in-out hover:bg-slate-800 hover:text-white md:flex"
      >
        <ChevronIcon
          className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}
        />
      </button>
    </>
  )
}

function ChevronIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12.5 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
    </svg>
  )
}

function GridIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  )
}

function InboxIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M3 11l2.5-6h9L17 11" strokeLinejoin="round" />
      <path
        d="M3 11v4a1 1 0 001 1h12a1 1 0 001-1v-4h-4.5a1 1 0 00-.9.55l-.2.4a1 1 0 01-.9.55H9.5a1 1 0 01-.9-.55l-.2-.4a1 1 0 00-.9-.55H3z"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BuildingIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="4" y="3" width="12" height="14" rx="1" />
      <path d="M7 7h2M11 7h2M7 10h2M11 10h2M7 13h2M11 13h2" strokeLinecap="round" />
    </svg>
  )
}

function StoreIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M3 8l1-4.5h12L17 8" strokeLinejoin="round" strokeLinecap="round" />
      <path
        d="M3 8a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4.5 8V16.5h11V8" strokeLinejoin="round" />
      <path d="M8.5 16.5V12h3v4.5" strokeLinejoin="round" />
    </svg>
  )
}

function UsersIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="7" cy="7" r="2.5" />
      <path d="M2.5 16c.5-3 2.2-4.5 4.5-4.5s4 1.5 4.5 4.5" strokeLinecap="round" />
      <circle cx="14.5" cy="7.5" r="2" />
      <path d="M12.8 11.7c1.9.2 3.2 1.6 3.7 4.3" strokeLinecap="round" />
    </svg>
  )
}

function ShieldIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path
        d="M10 2.5l6 2.2v4.8c0 4-2.6 6.8-6 8-3.4-1.2-6-4-6-8V4.7l6-2.2z"
        strokeLinejoin="round"
      />
      <path d="M7.5 10l1.8 1.8 3.2-3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function KeyIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="6.5" cy="8" r="3.5" />
      <path
        d="M9.6 9.5L17 9.5M14.5 9.5v3M12 9.5v2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TruckIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="2" y="6" width="9" height="7" rx="1" />
      <path d="M11 8.5h3.5L16 10.5V13h-5v-4.5z" strokeLinejoin="round" />
      <circle cx="6" cy="14.5" r="1.4" />
      <circle cx="13.5" cy="14.5" r="1.4" />
    </svg>
  )
}
