import { useNavigate } from 'react-router-dom'
import type { Work } from '@/data/schema'
import * as repo from '@/data/repo'
import { relTime, workTypeLabel } from '@/lib/format'
import { IconCheck, workTypeIcon } from './icons'
import { SplitBar, segsFromRoster } from './SplitBar'
import { Avatar, Badge } from './ui'

export function WorkTypeBadge({ type }: { type: Work['type'] }) {
  const Icon = workTypeIcon[type]
  return (
    <Badge tone="neutral">
      <Icon size={13} />
      {workTypeLabel[type]}
    </Badge>
  )
}

// ── Plain-language status (diagnosis 1: name the consequence) ─────────────────
type StatusTone = 'ok' | 'warn' | 'brand' | 'neutral'
export function workStatus(work: Work, meId: string): { label: string; tone: StatusTone } {
  const proposal = repo.openProposalFor(work.id)
  if (proposal) {
    const voted = repo.votesFor(proposal.id).some((v) => v.voter_user_id === meId)
    const mine = repo.affectedUsersFor(work.id, proposal).includes(meId)
    return mine && !voted ? { label: 'Needs your approval', tone: 'brand' } : { label: 'Waiting on others', tone: 'warn' }
  }
  const roster = repo.rosterFor(work.id)
  const unsigned = roster.find((r) => r.contribution.confirm_status === 'awaiting_account')
  if (unsigned) return { label: `${unsigned.name.split(' ')[0]} hasn't signed up`, tone: 'neutral' }
  return { label: `All ${roster.length} agreed`, tone: 'ok' }
}

export function StatusPill({ work, meId }: { work: Work; meId: string }) {
  const { label, tone } = workStatus(work, meId)
  if (tone === 'brand')
    return <span className="inline-flex items-center rounded-sm bg-brand px-2.5 py-1 text-[11.5px] font-semibold text-white">{label}</span>
  if (tone === 'ok')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-ok/30 bg-ok/12 px-2.5 py-1 text-[11.5px] font-semibold text-ok">
        <IconCheck size={12} /> {label}
      </span>
    )
  // warn / neutral → quiet outline with a hatched marker
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-bg-soft px-2.5 py-1 text-[11.5px] font-semibold text-ink-soft">
      <span className="hatch inline-block h-2 w-2" />
      {label}
    </span>
  )
}

// ── Grid card ─────────────────────────────────────────────────────────────────
export function WorkCard({ work }: { work: Work }) {
  const navigate = useNavigate()
  const me = repo.currentUser()
  const roster = repo.rosterFor(work.id)
  const uses = repo.usesWorks(work.id)
  const Icon = workTypeIcon[work.type]
  return (
    <button
      onClick={() => navigate(`/app/work/${work.id}`)}
      className="card group w-full p-4 text-left transition hover:border-brand/40 hover:bg-bg-hover"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center bg-bg-hover text-ink-soft">
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-bold text-ink">{work.primary_title}</h3>
            <p className="mt-0.5 truncate text-xs text-ink-faint">
              {workTypeLabel[work.type]}
              {uses.length > 0 && <> · built on {uses.map((u) => u.primary_title).join(', ')}</>}
            </p>
          </div>
        </div>
        <StatusPill work={work} meId={me.id} />
      </div>
      <SplitBar segments={segsFromRoster(roster, me.id)} showNames height={8} />
      <div className="mt-3 flex items-center justify-between">
        <AvatarStack roster={roster} max={4} size={24} />
        <span className="font-mono text-[11px] text-ink-faint">{relTime(work.updated_at)}</span>
      </div>
    </button>
  )
}

// ── Table (list view, 1a) ─────────────────────────────────────────────────────
// Shared column widths between header and rows.
const CELL = {
  who: 'hidden w-[240px] shrink-0 lg:block',
  status: 'hidden w-[168px] shrink-0 sm:block',
  updated: 'hidden w-[72px] shrink-0 text-right sm:block',
}

export function WorkTableHeader() {
  return (
    <div className="flex items-center gap-4 border-b border-line-soft px-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
      <span className="w-[30px] shrink-0" />
      <span className="flex-1">Work</span>
      <span className={CELL.who}>Who owns what</span>
      <span className={CELL.status}>Agreement</span>
      <span className={CELL.updated}>Updated</span>
    </div>
  )
}

export function WorkRow({ work }: { work: Work }) {
  const navigate = useNavigate()
  const me = repo.currentUser()
  const roster = repo.rosterFor(work.id)
  const uses = repo.usesWorks(work.id)
  const akas = repo.akasFor(work.id)
  const Icon = workTypeIcon[work.type]
  const needsYou = workStatus(work, me.id).tone === 'brand'

  const sub =
    uses.length > 0
      ? `${workTypeLabel[work.type]} · built on ${uses.map((u) => u.primary_title).join(', ')}`
      : akas.length > 0
        ? `${workTypeLabel[work.type]} · also known as ${akas[0].title}${akas.length > 1 ? ` +${akas.length - 1}` : ''}`
        : workTypeLabel[work.type]

  return (
    <button
      onClick={() => navigate(`/app/work/${work.id}`)}
      className={`group flex w-full items-center gap-4 border-b border-line-soft px-4 py-3.5 text-left transition hover:bg-bg-hover ${
        needsYou ? 'bg-[#0d0b0c] shadow-[inset_2px_0_0_#e63b3b]' : ''
      }`}
    >
      <span className="grid h-[30px] w-[30px] shrink-0 place-items-center bg-bg-hover text-ink-soft">
        <Icon size={15} />
      </span>

      <div className="min-w-0 flex-1 pr-2">
        <div className="truncate text-[14.5px] font-bold text-ink">{work.primary_title}</div>
        <div className="mt-0.5 truncate text-[11.5px] text-ink-faint">{sub}</div>
      </div>

      <div className={CELL.who}>
        <SplitBar segments={segsFromRoster(roster, me.id)} showNames height={8} />
      </div>
      <div className={CELL.status}>
        <StatusPill work={work} meId={me.id} />
      </div>
      <span className={`${CELL.updated} font-mono text-[11.5px] text-ink-faint`}>{relTime(work.updated_at)}</span>
    </button>
  )
}

function AvatarStack({ roster, max, size }: { roster: ReturnType<typeof repo.rosterFor>; max: number; size: number }) {
  return (
    <div className="flex -space-x-2">
      {roster.slice(0, max).map((r) => (
        <span key={r.contribution.id} className="ring-2 ring-bg-card">
          <Avatar
            name={r.name}
            hue={r.person.kind === 'user' ? r.person.user.avatar_hue : r.person.contact.avatar_hue}
            size={size}
            account={r.isAccount}
          />
        </span>
      ))}
      {roster.length > max && (
        <span
          className="grid place-items-center bg-bg-hover text-[10px] font-bold text-ink-soft ring-2 ring-bg-card"
          style={{ width: size, height: size }}
        >
          +{roster.length - max}
        </span>
      )}
    </div>
  )
}
