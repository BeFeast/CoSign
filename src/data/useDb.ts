import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe } from './db'
import type { Database } from './schema'

// Subscribe a component to the whole DB. Any repo mutation re-renders.
export function useDb(): Database {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
