const STATUS_TEXT = {
  live: { label: 'Live', className: 'll-status-live', note: 'Sharing location now.' },
  online: { label: 'Online', className: 'll-status-online', note: 'Signed in and active (no location yet).' },
  offline: { label: 'Offline', className: 'll-status-offline', note: 'Not signed in or app closed.' },
}

const BAND_TEXT = {
  precise: 'precise (GPS)',
  approximate: 'approximate (Wi-Fi)',
  coarse: 'coarse (network)',
  unknown: 'unknown',
}

const formatAccuracy = (m) => {
  if (m == null) return 'unknown'
  return m >= 1000 ? `±${(m / 1000).toFixed(1)} km` : `±${m} m`
}

export default function LiveLocationUserCard({ user, onClose }) {
  const status = STATUS_TEXT[user.status] ?? STATUS_TEXT.offline

  return (
    <div className="ll-panel ll-card">
      <div className="ll-card-header">
        <strong className="ll-card-name">{user.name}</strong>
        <button className="ll-close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {user.role && <div className="ll-subtext">Role: {user.role}</div>}

      <div className={status.className}>{status.label}</div>
      <div className="ll-subtext">{status.note}</div>

      {user.status === 'live' && (
        <div className="ll-card-details">
          {user.site && <div className="ll-site">At {user.site}</div>}
          <div>Position: {user.lat.toFixed(5)}, {user.lng.toFixed(5)}</div>
          <div>Accuracy: {formatAccuracy(user.accuracy)} ({BAND_TEXT[user.accuracyBand] ?? 'unknown'})</div>
          <div>Last update: {user.ageSeconds}s ago</div>

          <a
            href={`https://www.google.com/maps?q=${user.lat},${user.lng}`}
            target="_blank"
            rel="noreferrer"
            className="ll-link"
          >
            Open in Google Maps ↗
          </a>
        </div>
      )}
    </div>
  )
}