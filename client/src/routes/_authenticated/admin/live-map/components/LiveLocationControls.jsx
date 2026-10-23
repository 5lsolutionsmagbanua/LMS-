import { useState } from 'react'

const STATUS_LABEL = {
  live: '● live',
  online: '◐ online',
  offline: '○ offline',
}

export default function LiveLocationControls({
  loading,
  users = [],
  liveCount,
  onlineCount,
  canShare,
  sharing,
  onToggleSharing,
  selectedUserId,
  onSelectUser,
  error,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const offlineCount = users.length - liveCount - onlineCount

  return (
    <div
      style={{
        background: '#fff',
        color: '#111',
        padding: '10px 14px',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontSize: 14,
        width: '100%',
        maxWidth: 380,
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Compact Header (Always Visible) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 13 }}>
          {loading ? 'Loading…' : `${liveCount} live · ${onlineCount} online · ${offlineCount} off`}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#2563eb',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {isExpanded ? 'Hide Controls ▲' : 'Controls ▼'}
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingTop: 4,
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.3 }}>
            Live = sharing location. Online = signed in. Offline = closed.
          </div>

          <select
            value={selectedUserId ?? ''}
            onChange={(e) => onSelectUser(e.target.value || null)}
            disabled={users.length === 0}
            style={{
              padding: '8px 10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              backgroundColor: '#f8fafc',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <option value="">Find a user…</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.name}
                {u.role ? ` (${u.role})` : ''} {STATUS_LABEL[u.status] ?? ''}
              </option>
            ))}
          </select>

          {canShare && (
            <button
              onClick={onToggleSharing}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                background: sharing ? '#dc2626' : '#2563eb',
                color: '#fff',
                fontWeight: 500,
                fontSize: 13,
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {sharing ? 'Turn off my location sharing' : 'Turn on my location sharing'}
            </button>
          )}

          {error && <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 500 }}>{error}</div>}
        </div>
      )}
    </div>
  )
}
