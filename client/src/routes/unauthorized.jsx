// client/src/routes/unauthorized.jsx
import { createFileRoute, Link } from '@tanstack/react-router'
import Button from '../components/ui/Button'

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedRoute,
})

function UnauthorizedRoute() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xl shadow-slate-100">
        {/* Icon Badge */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#E31837] border border-red-100">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-500">
          You don’t have the required permissions or role to view this page. If you believe this is
          a mistake, please contact your system administrator.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full">
              Back to Portal
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full">
              Sign In Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
