import { useNavigate } from 'react-router-dom'
import type { Work } from '@/data/schema'
import * as repo from '@/data/repo'
import { pct, relTime, workTypeLabel } from '@/lib/format'
import { IconArrowRight, workTypeIcon } from './icons'
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

export function AgreementBadge({ status }: { status: Work['agreement_status'] }) {
  return status === 'pending' ? (
    <Badge tone="warn">Waiting on co-signs</Badge>
  ) : (
    <Badge tone="ok">Confirmed</Badge>
  )
}

export function ConfirmDot({ status }: { status: 'confirmed' | 'pending' | 'awaiting_account' }) {
  const map = {
    confirmed: { c: 'bg-ok', t: 'Confirmed' },
    pending: { c: 'bg-warn', t: 'Pending co-sign' },
    awaiting_account: { c: 'bg-ink-faint', t: 'Awaiting account' },
  }
  const m = map[status]
  return <span className={`inline-block h-2 w-2 rounded-sm ${m.c}`} title={m.t} />
}

export function WorkCard({ work }: { work: Work }) {
  const navigate = useNavigate()
  const roster = repo.rosterFor(work.id)
  const uses = repo.usesWorks(work.id)
  return (
    <button
      onClick={() => navigate(`/app/work/${work.id}`)}
      className="card group w-full p-4 text-left transition hover:border-brand/40 hover:bg-bg-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <WorkTypeBadge type={work.type} />
            {work.agreement_status === 'pending' && <AgreementBadge status="pending" />}
          </div>
          <h3 className="truncate text-base font-bold text-ink">{work.primary_title}</h3>
          {uses.length > 0 && (
            <p className="mt-0.5 truncate text-xs text-ink-faint">
              uses {uses.map((u) => u.primary_title).join(', ')}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <AvatarStack roster={roster} max={4} size={26} />
        <span className="text-xs text-ink-faint">
          {roster.length} {roster.length === 1 ? 'contributor' : 'contributors'} · {roster.map((r) => pct(r.contribution.split_percent)).join(' / ')}
        </span>
      </div>
    </button>
  )
}

// Compact list row (BeatStars-style), adapted to CoSign's data.
export function WorkRow({ work }: { work: Work }) {
  const navigate = useNavigate()
  const roster = repo.rosterFor(work.id)
  const uses = repo.usesWorks(work.id)
  const Icon = workTypeIcon[work.type]
  return (
    <button
      onClick={() => navigate(`/app/work/${work.id}`)}
      className="card group flex w-full items-center gap-3 p-2.5 text-left transition hover:border-brand/40 hover:bg-bg-hover sm:gap-4 sm:pr-4"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center bg-bg-hover text-ink-soft">
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-ink">{work.primary_title}</div>
        <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-faint">
          <span>{workTypeLabel[work.type]}</span>
          {uses.length > 0 && <span className="truncate">· uses {uses.map((u) => u.primary_title).join(', ')}</span>}
        </div>
      </div>

      <div className="hidden w-36 shrink-0 sm:block">
        {work.agreement_status === 'pending' ? <AgreementBadge status="pending" /> : <AgreementBadge status="confirmed" />}
      </div>

      <div className="hidden shrink-0 md:block">
        <AvatarStack roster={roster} max={3} size={24} />
      </div>

      <div className="hidden w-40 shrink-0 text-right font-mono text-xs text-ink-faint lg:block">
        {roster.map((r) => pct(r.contribution.split_percent)).join(' / ')}
      </div>

      <div className="hidden w-20 shrink-0 text-right text-xs text-ink-faint sm:block">{relTime(work.updated_at)}</div>

      <IconArrowRight size={16} className="shrink-0 text-ink-faint transition group-hover:text-ink" />
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
