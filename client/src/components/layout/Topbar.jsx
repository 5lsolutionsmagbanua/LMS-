// client/src/components/layout/Topbar.jsx
import { useState, useRef, useEffect } from 'react'
import { useLogout, useCurrentUser } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { PORTAL_MODULES } from './portalConfig'
import { getUserRoles, isSuperUserRole } from '../../utils/roleRouting'
import { THEME_OPTIONS } from '../../config/themeOptions'
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

const GLASS_BTN =
  'rounded-xl border border-transparent text-slate-600 transition-all duration-300 ' +
  'hover:border-white/60 hover:bg-white/50 hover:text-slate-900 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.7)] ' +
  'dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/10 dark:hover:text-white dark:hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]'

const GLASS_PANEL =
  'border border-white/50 bg-white/70 backdrop-blur-2xl backdrop-saturate-150 ' +
  'shadow-[0_20px_60px_-15px_rgb(0_0_0/0.35),inset_0_1px_0_rgb(255_255_255/0.7)] ' +
  'dark:border-white/10 dark:bg-slate-900/70 ' +
  'dark:shadow-[0_20px_60px_-15px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.08)]'

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

  const { colorTheme, handleThemeChange, isThemeLocked, isDark, toggleDarkMode } = useTheme()
  const logout = useLogout()
  const { data: user } = useCurrentUser()

  const userRoles = getUserRoles(user)
  const isSuperUser = isSuperUserRole(userRoles)

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

  // Close or reposition dropdowns when clicking outside, scrolling, or resizing
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

    const handleScrollOrResize = () => {
      if (themeMenuOpen) setThemeMenuOpen(false)
      if (menuOpen) setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [themeMenuOpen, menuOpen])

  const getCoordinates = (ref) => {
    if (!ref.current) return { top: 0, right: 0 }
    const rect = ref.current.getBoundingClientRect()
    return {
      top: rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
    }
  }

  const themeCoords = getCoordinates(themeBtnRef)
  const userCoords = getCoordinates(userBtnRef)

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between overflow-hidden border-b border-white/40 bg-white/50 px-4 shadow-[0_8px_32px_-12px_rgb(0_0_0/0.2),inset_0_-1px_0_rgb(255_255_255/0.5)] backdrop-blur-2xl backdrop-saturate-150 transition-colors md:px-6 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-[0_8px_32px_-12px_rgb(0_0_0/0.6),inset_0_-1px_0_rgb(255_255_255/0.06)]">
        {/* Liquid glow (theme-colored) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="liquid-blob-a absolute -left-10 -top-16 h-40 w-64 rounded-full bg-primary/30 blur-3xl dark:bg-primary/25" />
          <div className="liquid-blob-b absolute -right-10 -top-20 h-40 w-72 rounded-full bg-primary/20 blur-3xl dark:bg-primary/20" />
        </div>

        {/* Glossy sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-transparent dark:from-white/[0.05]"
        />

        <div className="relative flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Toggle menu"
            className={`-ml-1 p-2 ${GLASS_BTN}`}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold tracking-tight text-slate-900 md:text-lg dark:text-white">
            {headerTitle}
          </h1>
        </div>

        <div className="relative flex items-center gap-2">
          {finalPortals.length > 1 && (
            <button
              onClick={() => setPortalModalOpen(true)}
              className={`flex items-center gap-2 border-white/50 bg-white/40 px-3 py-2 text-xs font-medium shadow-[inset_0_1px_0_rgb(255_255_255/0.7)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] ${GLASS_BTN}`}
            >
              <SwitchPortalIcon className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">Switch Portal</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            disabled={isThemeLocked}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`p-2.5 ${
              isThemeLocked ? 'cursor-not-allowed text-slate-400 opacity-40' : GLASS_BTN
            }`}
          >
            {isDark ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Theme Picker */}
          <div className="relative">
            <button
              ref={themeBtnRef}
              disabled={isDisabled}
              onClick={() => setThemeMenuOpen((v) => !v)}
              className={`p-2.5 ${
                isDisabled ? 'cursor-not-allowed text-slate-400 opacity-40' : GLASS_BTN
              }`}
            >
              <PaletteIcon className="h-5 w-5" />
            </button>
            {themeMenuOpen && !isDisabled && (
              <Portal>
                <div
                  id="theme-dropdown"
                  style={{ top: `${themeCoords.top}px`, right: `${themeCoords.right}px` }}
                  className={`pointer-events-auto fixed z-50 w-64 max-w-[calc(100vw-24px)] rounded-3xl p-4 ${GLASS_PANEL}`}
                >
                  <div className="mb-3 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Theme Color
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {THEME_OPTIONS.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => onThemeSelect(t.id)}
                        className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border p-2.5 transition-all duration-300 ${
                          colorTheme === t.id
                            ? 'border-primary bg-primary/10 shadow-[0_6px_20px_-8px] shadow-primary/50 ring-1 ring-primary'
                            : 'border-white/50 bg-white/40 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                        }`}
                      >
                        <span
                          className="h-6 w-6 rounded-xl shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_4px_10px_-2px_rgb(0_0_0/0.3)]"
                          style={{ background: t.swatch }}
                        />
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
                          {t.label}
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
              className={`group flex items-center gap-2.5 px-2.5 py-1.5 ${GLASS_BTN}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_6px_16px_-4px] shadow-primary/60 ring-1 ring-white/40">
                {initial}
              </span>
              <span className="hidden text-sm font-semibold sm:block">{displayName}</span>
            </button>
            {menuOpen && (
              <Portal>
                <div
                  id="user-dropdown"
                  style={{ top: `${userCoords.top}px`, right: `${userCoords.right}px` }}
                  className={`pointer-events-auto fixed z-50 w-64 max-w-[calc(100vw-24px)] rounded-3xl py-3 ${GLASS_PANEL}`}
                >
                  <div className="border-b border-white/40 px-5 py-3 dark:border-white/10">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {userEmail}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={onLogoutClick}
                      disabled={logout.isPending}
                      className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400"
                    >
                      <SignOutIcon className="h-4 w-4" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm dark:bg-slate-950/60">
            <div
              className={`animate-in fade-in zoom-in-95 w-full max-w-md overflow-hidden rounded-3xl p-6 duration-150 ${GLASS_PANEL}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Switch Portal
                </h3>
                <button
                  onClick={() => setPortalModalOpen(false)}
                  className="rounded-xl p-1 text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
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
                      className={`flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-300 ${
                        isCurrent
                          ? 'border-primary bg-primary/10 text-slate-900 shadow-[0_8px_24px_-10px] shadow-primary/50 ring-1 ring-primary dark:text-white'
                          : 'border-white/50 bg-white/40 text-slate-700 hover:bg-white/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      <div
                        className={`rounded-xl p-2 ${
                          isCurrent
                            ? 'bg-primary text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.4)]'
                            : 'bg-white/60 text-slate-500 dark:bg-white/10 dark:text-slate-300'
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{portal.name}</p>
                        <p className="text-[11px] capitalize text-slate-500 dark:text-slate-400">
                          Role workspace
                        </p>
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
