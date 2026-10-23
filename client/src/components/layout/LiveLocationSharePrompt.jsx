import { useState } from 'react'
import { useAuthContext } from '../../hooks/useAuth'
import { useLiveLocationConsent } from '../../hooks/useLiveLocationConsent'
import { useLiveLocationShare } from '../../hooks/useLiveLocationShare'
import { usePermissionCheck } from '../../hooks/usePermissionCheck'
import { getLiveLocationUserId } from '../../utils/live-location-user-id'
import { getUserRoles, isSuperUserRole } from '../../utils/roleRouting'

const panel = {
  position: 'fixed',
  zIndex: 2000,
  background: '#ffffff',
  color: '#111111',
  borderRadius: 10,
  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
  fontSize: 14,
  lineHeight: 1.4,
  pointerEvents: 'auto',
}

const baseButton = {
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
  lineHeight: 1.2,
  cursor: 'pointer',
  opacity: 1,
  pointerEvents: 'auto',
}

const primaryButton = {
  ...baseButton,
  background: '#2563eb',
  color: '#ffffff',
  border: '1px solid #2563eb',
}

const secondaryButton = {
  ...baseButton,
  background: '#ffffff',
  color: '#111111',
  border: '1px solid #94a3b8',
}

const PROBLEMS = {
  blocked: {
    title: 'Location is blocked for this site',
    text: 'Click the lock icon in the address bar, set Location to Allow, then press Try again.',
  },
  unavailable: {
    title: 'Your device cannot find its location',
    text: 'On Windows: Settings → Privacy & security → Location. Turn on Location services and "Let desktop apps access your location", then press Try again. A phone with GPS is the most reliable option.',
  },
  waiting: {
    title: 'Still waiting for your location',
    text: 'Your device has not reported a position yet. Keep this tab open. A computer without GPS can take several minutes. Press Try again if it stays this way.',
  },
  unsupported: {
    title: 'This browser cannot share location',
    text: 'Use a current version of Chrome, Edge, or Safari.',
  },
}

export default function LiveLocationSharePrompt() {
  const { user } = useAuthContext()
  const userId = getLiveLocationUserId(user)
  const { can, isLoading: permLoading } = usePermissionCheck()
  const canShare = can('live_map', 'write')
  const isAdmin = isSuperUserRole(getUserRoles(user))

  const { consent, setConsent } = useLiveLocationConsent(userId)
  const location = useLiveLocationShare(
    Boolean(userId) && canShare && !permLoading && consent === 'granted',
  )
  const [reminderDismissed, setReminderDismissed] = useState(false)

  if (!user || permLoading || !canShare) return null

  if (!userId) {
    return (
      <div style={{ ...panel, bottom: 16, right: 16, maxWidth: 320, padding: '10px 12px' }}>
        Live location is unavailable: your account id could not be read.
      </div>
    )
  }

  // First visit: ask once
  if (consent === 'unset') {
    return (
      <div style={{ ...panel, bottom: 16, right: 16, maxWidth: 320, padding: '14px 16px' }}>
        <p style={{ margin: '0 0 12px' }}>
          Allow LMS to share your location with supervisors while you are signed in? They can see it
          on the live map. You can change this later on the Live Map page.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => setConsent('denied')} style={secondaryButton}>
            Not now
          </button>
          <button type="button" onClick={() => setConsent('granted')} style={primaryButton}>
            Allow
          </button>
        </div>
      </div>
    )
  }

  // Declined earlier: remind on each login until allowed (non-admin only)
  if (consent === 'denied' && !isAdmin && !reminderDismissed) {
    return (
      <div
        style={{
          ...panel,
          bottom: 16,
          right: 16,
          maxWidth: 340,
          padding: '12px 14px',
          background: '#fefce8',
          color: '#713f12',
        }}
      >
        <strong>Your location is off</strong>
        <div style={{ marginTop: 6 }}>
          Supervisors can't see you on the live map while location is off. Allow it to share your
          location while you are signed in.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
          <button type="button" onClick={() => setReminderDismissed(true)} style={secondaryButton}>
            Remind me later
          </button>
          <button type="button" onClick={() => setConsent('granted')} style={primaryButton}>
            Allow location
          </button>
        </div>
      </div>
    )
  }

  // Allowed, but the device can't find or send a position (non-admin only)
  const problem = location.sendError
    ? { title: 'Your location isn\u2019t reaching the map', text: location.sendError }
    : (PROBLEMS[location.status] ?? null)

  if (consent === 'granted' && problem && !isAdmin && !reminderDismissed) {
    const isBlocked = location.status === 'blocked'

    return (
      <div
        style={{
          ...panel,
          bottom: 16,
          left: 16,
          maxWidth: 380,
          padding: '12px 14px',
          background: isBlocked ? '#fff7ed' : '#fefce8',
          color: isBlocked ? '#9a3412' : '#713f12',
        }}
      >
        <strong>{problem.title}</strong>
        <div style={{ marginTop: 6 }}>{problem.text}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
          <button type="button" onClick={() => setReminderDismissed(true)} style={secondaryButton}>
            Hide for now
          </button>
          <button type="button" onClick={location.retry} style={primaryButton}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  return null
}
