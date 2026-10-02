// client/src/components/layout/Topbar.jsx
import { useState, useRef, useEffect } from 'react'
import { useLogout, useCurrentUser } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { PORTAL_MODULES } from './portalConfig'
import { getUserRoles, isSuperUserRole } from '../../utils/roleRouting'
import Portal from '../ui/Portal'
import {
  MenuIcon,
  SwitchPortalIcon,
  PaletteIcon,
  SignOutIcon,
  ShieldCheckIcon,
  WorkflowIcon,
  TruckIcon,
  UserGroupIcon,
} from '../ui/Icons'

const ICONS_MAP = {
  admin: ShieldCheckIcon,
  manager: WorkflowIcon,
  driver: TruckIcon,
  staff: UserGroupIcon,
  developer: ShieldCheckIcon,
}

export default function Topbar({
  title,
  onMenuClick,
  isThemeDisabled = false,
  activePortal,
  onPortalChange,
  availablePortals,
  isPortalModalOpen,
  setIsPortalModalOpen,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [internalPortalModal, setInternalPortalModal] = useState(false)

  const portalModalOpen = isPortalModalOpen !== undefined ? isPortalModalOpen : internalPortalModal
  const setPortalModalOpen = setIsPortalModalOpen || setInternalPortalModal

  const themeBtnRef = useRef(null)
  const userBtnRef = useRef(null)

  const { colorTheme, handleThemeChange, isThemeLocked } = useTheme()
  const logout = useLogout()
  const { data: user } = useCurrentUser()

  const userRoles = getUserRoles(user)
  const isSuperUser = isSuperUserRole(userRoles)

  // For an ordinary role, the header should say who they are, not which
  // shared screen they happen to be viewing — a driver granted access to
  // /admin/branches is still a Driver, not suddenly "in" the Admin Portal.
  // Only super users, who genuinely switch between portals, get the
  // portal's own name here.
  const headerTitle = isSuperUser
    ? activePortal?.name ||
      (userRoles[0]
        ? `${userRoles[0].charAt(0).toUpperCase() + userRoles[0].slice(1)} Dashboard`
        : 'Dashboard')
    : user?.roleName
      ? `${user.roleName} Portal`
      : userRoles[0]
        ? `${userRoles[0].charAt(0).toUpperCase() + userRoles[0].slice(1)} Portal`
        : 'Dashboard'

  const computedPortals = PORTAL_MODULES.filter((portal) => {
    if (isSuperUser) return true
    return portal.allowedRoles.some((role) => userRoles.includes(role.toLowerCase()))
  })

  const finalPortals = availablePortals?.length > 0 ? availablePortals : computedPortals

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Account'
  const userEmail = user?.email || user?.username || ''
  const initial = displayName.charAt(0).toUpperCase()
  const isDisabled = isThemeDisabled || isThemeLocked

  const onThemeSelect = (newTheme) => {
    if (isDisabled) return
    handleThemeChange(newTheme)
    setThemeMenuOpen(false)
  }

  const onLogoutClick = () => {
    setMenuOpen(false)
    logout.mutate()
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        themeMenuOpen &&
        !e.target.closest('#theme-dropdown') &&
        !themeBtnRef.current?.contains(e.target)
      ) {
        setThemeMenuOpen(false)
      }
      if (
        menuOpen &&
        !e.target.closest('#user-dropdown') &&
        !userBtnRef.current?.contains(e.target)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [themeMenuOpen, menuOpen])

  const getCoordinates = (ref) => {
    if (!ref.current) return { top: 0, right: 0 }
    const rect = ref.current.getBoundingClientRect()
    return { top: rect.bottom + 8, right: window.innerWidth - rect.right }
  }

  const themeCoords = getCoordinates(themeBtnRef)
  const userCoords = getCoordinates(userBtnRef)

  return (
    <>
      <header className="h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Toggle menu"
            className="-ml-1 p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <h1 className="text-base md:text-lg font-semibold text-slate-900 tracking-tight">
            {headerTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {finalPortals.length > 1 && (
            <button
              onClick={() => setPortalModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all font-medium text-xs border border-slate-200/60 shadow-sm"
            >
              <SwitchPortalIcon className="w-4 h-4 text-primary" />
              <span className="hidden md:inline">Switch Portal</span>
            </button>
          )}

          {/* Theme Picker */}
          <div className="relative">
            <button
              ref={themeBtnRef}
              disabled={isDisabled}
              onClick={() => setThemeMenuOpen((v) => !v)}
              className={`p-2.5 rounded-xl transition-all ${isDisabled ? 'opacity-40 cursor-not-allowed text-slate-400' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <PaletteIcon className="w-5 h-5" />
            </button>
            {themeMenuOpen && !isDisabled && (
              <Portal>
                <div
                  id="theme-dropdown"
                  style={{ top: `${themeCoords.top}px`, right: `${themeCoords.right}px` }}
                  className="absolute w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 pointer-events-auto"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
                    Theme Color
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['default', 'blue', 'emerald'].map((t, idx) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => onThemeSelect(t)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border cursor-pointer ${colorTheme === t ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200'}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-xl shadow-sm ${idx === 0 ? 'bg-[#E31837]' : idx === 1 ? 'bg-blue-600' : 'bg-emerald-600'}`}
                        />
                        <span className="text-[11px] font-medium text-slate-700 capitalize">
                          {t === 'default' ? 'Red' : t}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </Portal>
            )}
          </div>

          {/* User Account Dropdown */}
          <div className="relative ml-1">
            <button
              ref={userBtnRef}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-slate-100 transition-colors group"
            >
              <span className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-md">
                {initial}
              </span>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                {displayName}
              </span>
            </button>
            {menuOpen && (
              <Portal>
                <div
                  id="user-dropdown"
                  style={{ top: `${userCoords.top}px`, right: `${userCoords.right}px` }}
                  className="absolute w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 pointer-events-auto"
                >
                  <div className="px-5 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={onLogoutClick}
                      disabled={logout.isPending}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SignOutIcon className="w-4 h-4" />
                      {logout.isPending ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              </Portal>
            )}
          </div>
        </div>
      </header>

      {/* Portal Switching Modal */}
      {portalModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Switch Portal</h3>
                <button
                  onClick={() => setPortalModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Select a portal workspace you would like to switch into based on your assigned
                permissions.
              </p>
              <div className="space-y-2">
                {finalPortals.map((portal) => {
                  const IconComponent = portal.icon || ICONS_MAP[portal.id] || ShieldCheckIcon
                  const isCurrent = activePortal?.id === portal.id
                  return (
                    <button
                      key={portal.id}
                      onClick={() => {
                        onPortalChange?.(portal)
                        setPortalModalOpen(false)
                      }}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all text-left ${
                        isCurrent
                          ? 'border-primary bg-primary/5 text-slate-900 ring-1 ring-primary'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl ${isCurrent ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{portal.name}</p>
                        <p className="text-[11px] text-slate-400 capitalize">Role workspace</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
