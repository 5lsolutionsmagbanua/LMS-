// client/src/routes/login.jsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useLogin } from '../hooks/useAuth'
import Alert from '../components/ui/Alert'

const NOTICES = {
  'logged-out': { variant: 'success', message: 'You have been signed out.' },
  'session-expired': { variant: 'info', message: 'Your session expired. Please sign in again.' },
}

export const Route = createFileRoute('/login')({
  validateSearch: (search) => ({
    notice: typeof search.notice === 'string' ? search.notice : undefined,
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: Login,
})

function Login() {
  const { notice, redirect: redirectTo } = Route.useSearch()
  const [dismissed, setDismissed] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()

  const activeNotice = !dismissed && notice ? NOTICES[notice] : null
  const canSubmit = username.trim() && password && !login.isPending

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return

    // Only honor internal paths. With none, useLogin sends the user to their own portal.
    const safeRedirect =
      redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : undefined

    login.mutate({ username, password, redirectTo: safeRedirect })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-[26rem] flex flex-col items-center space-y-4">
        {activeNotice && (
          <div className="w-full">
            <Alert variant={activeNotice.variant} onDismiss={() => setDismissed(true)}>
              {activeNotice.message}
            </Alert>
          </div>
        )}

        {login.isError && (
          <div className="w-full">
            <Alert variant="error" onDismiss={() => login.reset()}>
              {login.error?.response?.data?.message || 'Invalid username or password'}
            </Alert>
          </div>
        )}

        <div className="w-full flex flex-col items-center">
          <h1 className="text-[2.618rem] leading-tight font-bold text-slate-900 mb-1 tracking-tight text-center">
            LMS
          </h1>
          <p className="text-sm text-slate-500 mb-6 text-center">Sign in to continue</p>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-10 rounded-2xl shadow-lg border-t-[6px] border-t-primary w-full transition-all"
          >
            <div className="mb-5">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder=""
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
            >
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
