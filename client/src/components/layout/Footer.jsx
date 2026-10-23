// client/src/components/layout/Footer.jsx
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative flex shrink-0 flex-col items-center justify-between gap-3 overflow-hidden border-t border-white/40 bg-white/50 px-6 py-4 text-xs text-slate-500 shadow-[0_-8px_32px_-12px_rgb(0_0_0/0.15),inset_0_1px_0_rgb(255_255_255/0.5)] backdrop-blur-2xl backdrop-saturate-150 transition-colors sm:flex-row dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-400 dark:shadow-[0_-8px_32px_-12px_rgb(0_0_0/0.5),inset_0_1px_0_rgb(255_255_255/0.06)]">
      {/* Glossy sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent dark:from-white/[0.05]"
      />

      {/* Copyright Information */}
      <div className="relative flex items-center gap-2">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          &copy; {currentYear} LMS
        </span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span className="text-slate-500 dark:text-slate-400">All rights reserved.</span>
      </div>

      {/* Status & Version Information */}
      <div className="relative flex items-center gap-3">
        {/* Live System Status Badge */}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 shadow-[inset_0_1px_0_rgb(255_255_255/0.5)] backdrop-blur dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgb(16_185_129/0.7)]" />
          System Online
        </div>

        {/* Version Tag */}
        <span className="rounded-full border border-white/50 bg-white/50 px-2.5 py-0.5 font-mono text-slate-600 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
          v1.0.0
        </span>
      </div>
    </footer>
  )
}
