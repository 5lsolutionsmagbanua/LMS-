// Returns the signed-in user's id, whichever field name the auth response uses.
export const getLiveLocationUserId = (user) => {
  if (!user) return null
  const id = user.id ?? user.userId ?? user.user_id ?? user.mu_id ?? null
  return id == null || id === '' ? null : String(id)
}
