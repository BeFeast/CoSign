import type { CSSProperties } from 'react'
import { pct } from '@/lib/format'

// One person's share of a work. `status` drives the fill:
//   agreed      → solid (your share red, others grey)
//   unconfirmed → hatched (pending / not on CoSign yet)
//   proposed    → your hatched-red pending share in a change request
export type SplitSeg = {
  name: string
  pct: number
  isYou?: boolean
  status?: 'agreed' | 'unconfirmed' | 'proposed'
}

// Build segments straight from a repo roster (rosterFor) for the current user.
type RosterLike = {
  name: string
  contribution: { split_percent: number; user_id: string | null; confirm_status: string }
}
export function segsFromRoster(roster: RosterLike[], meId: string): SplitSeg[] {
  return roster.map((r) => ({
    name: r.name,
    pct: r.contribution.split_percent,
    isYou: r.contribution.user_id === meId,
    status: r.contribution.confirm_status === 'confirmed' ? 'agreed' : 'unconfirmed',
  }))
}

const num = (n: number) => pct(n).replace('%', '')

// Proportional split bar. One glance = your cut (red) and whether it's settled.
export function SplitBar({
  segments,
  height = 8,
  showNames = false,
  className = '',
}: {
  segments: SplitSeg[]
  height?: number
  showNames?: boolean
  className?: string
}) {
  let otherI = 0
  return (
    <div className={className}>
      <div className="flex gap-[2px]" style={{ height }}>
        {segments.map((s, i) => {
          const agreed = (s.status ?? 'agreed') === 'agreed'
          const style: CSSProperties = { width: `${s.pct}%` }
          let cls = ''
          if (s.isYou) {
            if (agreed) style.background = '#e63b3b'
            else cls = 'hatch-red'
          } else if (agreed) {
            style.background = otherI++ % 2 === 0 ? '#55555f' : '#3a3a42'
          } else {
            cls = 'hatch'
          }
          return <span key={i} className={cls} style={style} />
        })}
      </div>
      {showNames && (
        <div className="mt-1.5 font-mono text-[11px] leading-relaxed text-ink-soft">
          {segments.map((s, i) => (
            <span key={i}>
              {i > 0 && <span className="text-ink-dim"> · </span>}
              <span className={s.isYou ? 'text-brand-soft' : ''}>
                {s.isYou ? 'You' : s.name} {num(s.pct)}
                {s.status === 'proposed' && ' (proposed)'}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Legend explaining the fills — shown once under the catalog table.
export function SplitLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Reading the bars</span>
      <LegendItem label="Your share">
        <span className="inline-block h-2 w-4 bg-brand" />
      </LegendItem>
      <LegendItem label="Agreed">
        <span className="inline-block h-2 w-4" style={{ background: '#55555f' }} />
      </LegendItem>
      <LegendItem label="Not confirmed yet">
        <span className="hatch inline-block h-2 w-4" />
      </LegendItem>
    </div>
  )
}

function LegendItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11.5px] text-ink-soft">
      {children}
      {label}
    </span>
  )
}
