// client/src/components/ui/Button.jsx
const VARIANTS = {
  // Primary theme-colored button
  primary:
    'bg-primary text-on-primary border border-white/30 hover:brightness-110 focus:ring-primary/60 ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_8px_20px_-6px] shadow-primary/50 ' +
    'dark:border-white/15',

  // Frosted glass
  secondary:
    'bg-white/60 text-slate-700 border border-slate-200/80 hover:bg-white/80 focus:ring-primary/40 backdrop-blur ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.7)] ' +
    'dark:bg-white/10 dark:text-slate-200 dark:border-white/10 dark:hover:bg-white/15 ' +
    'dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]',

  // Theme-adaptive liquid gradient
  liquid:
    'btn-liquid-flow text-on-primary border border-white/40 hover:brightness-110 focus:ring-primary/60 ' +
    'dark:border-white/20',

  // Fixed color on purpose: destructive actions should always read as destructive
  danger:
    'bg-rose-600 text-white border border-white/30 hover:brightness-110 focus:ring-rose-500/60 ' +
    'shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_8px_20px_-6px] shadow-rose-600/50 ' +
    'dark:border-white/15',

  // Text-style button
  ghost:
    'bg-transparent text-slate-600 border border-transparent hover:bg-slate-900/5 hover:border-slate-200/70 focus:ring-primary/40 ' +
    'dark:text-slate-300 dark:hover:bg-white/10 dark:hover:border-white/10',

  // Outlined button (used for "Close" in dialogs)
  outline:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-primary/40 focus:ring-primary/40 ' +
    'shadow-2xs ' +
    'dark:bg-slate-900/60 dark:text-slate-200 dark:border-white/15 dark:hover:bg-slate-800 dark:hover:border-primary/40',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-base rounded-2xl',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent
        active:scale-[0.98]
        disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100
        ${VARIANTS[variant] ?? VARIANTS.primary} ${SIZES[size] ?? SIZES.md} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  )
}