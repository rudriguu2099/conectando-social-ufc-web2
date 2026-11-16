const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const failures = new Map<string, { count: number; resetAt: number }>()

// ms until the key can try again, 0 if not blocked
export function blockedFor(key: string) {
  const f = failures.get(key)
  if (!f) return 0
  if (f.resetAt <= Date.now()) {
    failures.delete(key)
    return 0
  }
  return f.count >= MAX_ATTEMPTS ? f.resetAt - Date.now() : 0
}

export function recordFailure(key: string) {
  const now = Date.now()
  if (failures.size > 10_000) for (const [k, f] of failures) if (f.resetAt <= now) failures.delete(k)
  const f = failures.get(key)
  if (!f || f.resetAt <= now) failures.set(key, { count: 1, resetAt: now + WINDOW_MS })
  else f.count++
}

export function clearFailures(key: string) {
  failures.delete(key)
}
