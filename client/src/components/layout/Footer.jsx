export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="shrink-0 bg-white border-t border-slate-200/80 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors">
      {/* Copyright Information */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-700">&copy; {currentYear} LMS</span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-400">All rights reserved.</span>
      </div>

      {/* Status & Version Information */}
      <div className="flex items-center gap-3">
        {/* Live System Status Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/80 font-medium text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>

        {/* Version Tag */}
        <span className="font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
          v1.0.0
        </span>
      </div>
    </footer>
  )
}
