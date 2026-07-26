import type { Database } from './schema'
import { buildSeed } from './seed'

const KEY = 'cosign.db.v1'

let cache: Database | null = null
const listeners = new Set<() => void>()

function persist(db: Database) {
  cache = db
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // ignore quota / private-mode errors — in-memory cache still works
  }
  for (const fn of listeners) fn()
}

export function loadDb(): Database {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      cache = JSON.parse(raw) as Database
      return cache
    }
  } catch {
    // fall through to seed
  }
  const seeded = buildSeed()
  persist(seeded)
  return seeded
}

// Apply a mutation and publish a NEW top-level object reference so
// useSyncExternalStore detects the change and re-renders. Mutators may edit the
// draft in place (nested arrays are shared) — the shallow copy is what matters.
export function writeDb(mutator: (db: Database) => Database): Database {
  const next = { ...mutator(loadDb()) }
  persist(next)
  return next
}

export function resetDb(): Database {
  const seeded = buildSeed()
  persist(seeded)
  return seeded
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// react-friendly external store snapshot
export function getSnapshot(): Database {
  return loadDb()
}
