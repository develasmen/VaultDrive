const SESSION_KEY = 'vaultdrive_user'

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
