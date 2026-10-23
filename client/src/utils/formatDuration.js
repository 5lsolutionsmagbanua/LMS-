// client/src/utils/formatDuration.js
export const fmtMinutes = (m) => {
  if (m === null || m === undefined) return '–'
  const total = Math.round(Number(m))
  if (total < 60) return `${total} min`
  return `${Math.floor(total / 60)}h ${String(total % 60).padStart(2, '0')}m`
}
