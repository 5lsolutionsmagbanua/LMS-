// Returns the signed-in user's id, whichever field name the auth response uses.
// If your /auth/me response uses another name, add it to the list.
export const getUserId = (user) => {
  if (!user) return null
  const id = user.id ?? user.userId ?? user.user_id ?? user.mu_id ?? null
  return id == null || id === '' ? null : String(id)
}
