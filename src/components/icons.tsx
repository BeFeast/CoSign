import type { WorkType } from '@/data/schema'

type P = { className?: string; size?: number }
const s = (size = 20) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const })

export const IconLibrary = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M3 5h18M3 12h18M3 19h18" /></svg>
)
export const IconStack = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></svg>
)
export const IconUsers = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
)
export const IconBell = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
)
export const IconUser = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
)
export const IconPlus = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconSearch = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
)
export const IconCheck = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M20 6 9 17l-5-5" /></svg>
)
export const IconX = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M18 6 6 18M6 6l12 12" /></svg>
)
export const IconLink = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
)
export const IconShare = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" /></svg>
)
export const IconCopy = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
)
export const IconArrowRight = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
)
export const IconArrowLeft = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
)
export const IconClock = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
export const IconTrash = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
)
export const IconEdit = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
)
export const IconSwap = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M7 4 3 8l4 4" /><path d="M3 8h14a4 4 0 0 1 4 4M17 20l4-4-4-4" /><path d="M21 16H7a4 4 0 0 1-4-4" /></svg>
)
export const IconSpark = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>
)
export const IconExternal = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
)
export const IconInfo = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>
)
export const IconAlert = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M12 8v5M12 17h.01" /></svg>
)
export const IconLock = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><rect x="4" y="11" width="16" height="10" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
)
export const IconRows = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
)
export const IconGrid = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
)
// Work-type glyphs — waveform (sample), pad grid (beat), mic (song).
export const IconSample = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><path d="M4 10v4M8.5 6v12M13 8v8M17.5 4v16M21 10v4" /></svg>
)
export const IconBeat = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><rect x="4" y="4" width="7" height="7" /><rect x="13" y="4" width="7" height="7" /><rect x="4" y="13" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /></svg>
)
export const IconSong = ({ size, className }: P) => (
  <svg {...s(size)} className={className}><rect x="9" y="3" width="6" height="10" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" /></svg>
)

export const workTypeIcon: Record<WorkType, (p: P) => JSX.Element> = {
  sample: IconSample,
  beat: IconBeat,
  song: IconSong,
}
