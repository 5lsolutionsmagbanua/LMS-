// client/src/components/ui/NotFound.jsx
import { Link } from '@tanstack/react-router'
import { useAuthContext } from '../../hooks/useAuth'
import { getLandingPortalForUser } from '../../utils/roleRouting'

const MESSAGES = {
  'not-found': {
    code: '404',
    title: 'Page not found',
    text: "This page does not exist or you don't have access to it.",
  },
  unauthorized: {
    code: '403',
    title: 'Access denied',
    text: 'Sorry, you are not authorized to access this page.',
  },
}

export default function NotFound({ variant = 'not-found' }) {
  const { user } = useAuthContext()
  const { code, title, text } = MESSAGES[variant] ?? MESSAGES['not-found']

  // Send people back to their own portal, not a hardcoded one. Signed-out
  // visitors go to the login screen. `getLandingPortalForUser` returns
  // '/unauthorized' for unknown roles, so avoid linking to that from here.
  const landing = user ? getLandingPortalForUser(user) : '/login'
  const homePath = landing === '/unauthorized' ? '/login' : landing

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold text-[#E31837] mb-2">{code}</p>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-sm text-slate-500 mb-6">{text}</p>
      <Link
        to={homePath}
        className="text-sm font-medium text-white bg-[#E31837] px-4 py-2 rounded-lg hover:bg-[#c11530] transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
