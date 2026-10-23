// client/src/routes/_authenticated/admin/live-map/components/LiveLocationMap.jsx
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [14.3417, 121.0802] // Biñan, Laguna

// Fits the map to the markers once, when the first positions arrive
function FitOnce({ points }) {
  const map = useMap()
  const done = useRef(false)

  useEffect(() => {
    if (done.current || points.length === 0) return
    map.fitBounds(
      points.map((p) => [p.lat, p.lng]),
      { padding: [60, 60], maxZoom: 16 },
    )
    done.current = true
  }, [points, map])

  return null
}

// Flies to the selected user when the selection changes
function FocusOnSelected({ points, selectedUserId }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedUserId) return
    const target = points.find((p) => p.userId === selectedUserId)
    if (target) {
      map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 16), { duration: 0.8 })
    }
    // Runs only when the selection changes, not on every poll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId])

  return null
}

export default function LiveLocationMap({
  positions,
  currentUserId,
  selectedUserId,
  onSelectUser,
}) {
  return (
    <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <FitOnce points={positions} />
      <FocusOnSelected points={positions} selectedUserId={selectedUserId} />

      {positions.map((p) => {
        const isMe = p.userId === currentUserId
        const isSelected = p.userId === selectedUserId
        return (
          <CircleMarker
            key={p.userId}
            center={[p.lat, p.lng]}
            radius={isSelected ? 11 : isMe ? 9 : 7}
            eventHandlers={{ click: () => onSelectUser?.(p.userId) }}
            pathOptions={{
              color: isSelected ? '#facc15' : '#fff',
              weight: isSelected ? 3 : 2,
              fillColor: isMe ? '#2563eb' : '#16a34a',
              fillOpacity: 1,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]}>
              {isMe ? `${p.name} (you)` : p.name}
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
