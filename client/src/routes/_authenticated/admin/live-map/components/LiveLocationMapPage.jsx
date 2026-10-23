import { useState } from 'react'
import LiveLocationMap from './LiveLocationMap'
import LiveLocationControls from './LiveLocationControls'
import LiveLocationUserCard from './LiveLocationUserCard'
import { useAuthContext } from '../../../../../hooks/useAuth'
import { useLiveLocationUsers } from '../../../../../hooks/useLiveLocationUsers'
import { useLiveLocationConsent } from '../../../../../hooks/useLiveLocationConsent'
import { usePermissionCheck } from '../../../../../hooks/usePermissionCheck'
import { getLiveLocationUserId } from '../../../../../utils/live-location-user-id'

export default function LiveLocationMapPage() {
  const { user } = useAuthContext()
  const myId = getLiveLocationUserId(user)
  const { can } = usePermissionCheck()
  const canShare = can('live_map', 'write')

  const { users, loading, error } = useLiveLocationUsers()
  const { consent, setConsent } = useLiveLocationConsent(myId)
  const [selectedUserId, setSelectedUserId] = useState(null)

  const liveUsers = users.filter((u) => u.status === 'live')
  const onlineCount = users.filter((u) => u.status === 'online').length
  const selectedUser = users.find((u) => u.userId === selectedUserId) ?? null

  return (
    <div
      style={{
        position: 'relative',
        height: 'calc(100vh - 64px)',
        height: 'calc(100dvh - 64px)',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Controls Wrapper */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <LiveLocationControls
            loading={loading}
            users={users}
            liveCount={liveUsers.length}
            onlineCount={onlineCount}
            canShare={canShare}
            sharing={consent === 'granted'}
            onToggleSharing={() => setConsent(consent === 'granted' ? 'denied' : 'granted')}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
            error={error}
          />
        </div>
      </div>

      {/* Map Wrapper */}
      <div
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <LiveLocationMap
          positions={liveUsers}
          currentUserId={myId}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
      </div>

      {/* User Card Wrapper */}
      {selectedUser && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            left: '12px',
            right: '12px',
            zIndex: 20,
          }}
        >
          <LiveLocationUserCard user={selectedUser} onClose={() => setSelectedUserId(null)} />
        </div>
      )}
    </div>
  )
}
