// client/src/components/layout/Sidebar.jsx
import { Link } from '@tanstack/react-router'
import { useAuthContext } from '../../hooks/useAuth'
import { getUserRoles, isSuperUserRole, getLandingPortalForUser } from '../../utils/roleRouting'
import { canAccessSuffix } from '../../constants/permissionsMap'

// All possible nav items. The permission matrix decides what actually shows.
const ALL_NAV_ITEMS = [
  { label: 'Stock Requests', suffix: '/pending-requests', icon: InboxIcon },
  { label: 'Branches', suffix: '/branches', icon: BuildingIcon },
  { label: 'Stores', suffix: '/stores', icon: StoreIcon },
  { label: 'Users', suffix: '/users', icon: UsersIcon },
  { label: 'Roles', suffix: '/roles', icon: ShieldIcon },
  { label: 'Vehicles', suffix: '/vehicles', icon: TruckIcon },
  { label: 'Vehicle Types', suffix: '/vehicle-types', icon: TruckIcon },
  { label: 'Live Map', suffix: '/live-map', icon: MapIcon, openToAll: false },
  { label: 'Access Control', suffix: '/permissions', icon: KeyIcon },
]

export default function Sidebar({ isOpen, onClose, onToggle, activePortal }) {
  const { user, permissions } = useAuthContext()
  const userRoles = getUserRoles(user)
  const isSuperUser = isSuperUserRole(userRoles)
  const homePath = getLandingPortalForUser(user)

  // Keep the shared module base where your actual router screens are defined
  const MODULE_BASE = '/admin'

  const visibleItems = [
    {
      label: 'Dashboard',
      to: isSuperUser ? (activePortal?.path ?? homePath) : homePath,
      icon: GridIcon,
      // Dashboard sits at the admin root, so it must match exactly.
      // Otherwise it stays highlighted on every /admin/* page.
      exact: true,
    },

    ...ALL_NAV_ITEMS.filter(
      (item) => item.openToAll || isSuperUser || canAccessSuffix(permissions, item.suffix),
    ).map((item) => ({
      ...item,
      to: `${MODULE_BASE}${item.suffix}`,
      exact: false,
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
          className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm transition-opacity md:hidden dark:bg-slate-950/50"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex min-h-screen w-64 shrink-0 transform flex-col overflow-hidden
        border-r border-white/40 bg-white/50 text-slate-600 shadow-[8px_0_40px_-12px_rgb(0_0_0/0.25),inset_-1px_0_0_rgb(255_255_255/0.5)]
        backdrop-blur-2xl backdrop-saturate-150 transition-transform duration-300 ease-in-out
        dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300
        dark:shadow-[8px_0_40px_-12px_rgb(0_0_0/0.6),inset_-1px_0_0_rgb(255_255_255/0.08)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Liquid blobs (theme-colored, decorative only) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="liquid-blob-a absolute -left-16 -top-10 h-56 w-56 rounded-full bg-primary/40 blur-3xl dark:bg-primary/30" />
          <div className="liquid-blob-b absolute -bottom-16 -right-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl dark:bg-primary/25" />
        </div>

        {/* Glossy sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-transparent dark:from-white/[0.06]"
        />

        {/* Header */}
        <div className="relative flex h-16 items-center justify-between border-b border-white/30 px-6 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/50 bg-primary text-sm font-black tracking-wider text-on-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_4px_16px_-4px] shadow-primary/40 dark:border-white/15">
              L
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight tracking-wide text-slate-900 dark:text-white">
                LMS
              </span>
              {headerLabel && (
                <span className="text-[10px] font-medium leading-tight text-slate-500 dark:text-slate-400">
                  {headerLabel}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/50 hover:text-slate-900 md:hidden dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 space-y-1.5 overflow-y-auto px-3.5 py-6">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-transparent px-3.5 py-3 text-sm font-medium
              text-slate-600 transition-all duration-300
              hover:bg-slate-900/5 hover:text-slate-900
              dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white
              [&.active]:bg-primary [&.active]:font-semibold [&.active]:text-on-primary
              [&.active]:shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_8px_24px_-8px] [&.active]:shadow-primary/50
              [&.active]:ring-1 [&.active]:ring-slate-900/10
              dark:[&.active]:ring-white/20"
            >
              {/* moving shine on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 group-hover:left-[150%] dark:via-white/10"
              />
              <item.icon className="relative h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="relative">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="relative flex items-center justify-between border-t border-white/30 bg-white/20 px-6 py-4 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
          <span>Version</span>
          <span className="rounded-full border border-white/50 bg-white/50 px-2.5 py-0.5 font-mono text-slate-600 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
            v1.0.0
          </span>
        </div>
      </aside>

      {/* Edge toggle handle, desktop only */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        style={{ left: isOpen ? '16rem' : '0px' }}
        className="fixed top-1/2 z-40 hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/60 text-slate-600 shadow-[0_8px_24px_-6px_rgb(0_0_0/0.3),inset_0_1px_0_rgb(255_255_255/0.7)] backdrop-blur-xl transition-[left,background-color] duration-300 ease-in-out hover:bg-white/80 hover:text-slate-900 md:flex dark:border-white/15 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-white"
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

function MapIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M7 4L2.5 5.5v10L7 14l6 2 4.5-1.5v-10L13 6 7 4z" strokeLinejoin="round" />
      <path d="M7 4v10M13 6v10" strokeLinejoin="round" />
    </svg>
  )
}
