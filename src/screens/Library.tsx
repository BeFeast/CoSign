import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { workTypes } from '@/data/schema'
import type { WorkType } from '@/data/schema'
import { Button, EmptyState } from '@/components/ui'
import { IconAlert, IconArrowRight, IconGrid, IconPlus, IconRows, IconSearch, IconStack, workTypeIcon } from '@/components/icons'
import { WorkCard, WorkRow, WorkTableHeader } from '@/components/work-bits'
import { SplitLegend } from '@/components/SplitBar'
import { pct, relTime, workTypeLabel } from '@/lib/format'

const VIEW_KEY = 'cosign.library.view'
type ViewMode = 'grid' | 'list'

export default function Library() {
  const db = useDb()
  const navigate = useNavigate()
  const me = repo.currentUser()
  const [q, setQ] = useState('')
  const [type, setType] = useState<WorkType | 'all'>('all')
  const [view, setView] = useState<ViewMode>(() => {
    try { return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid' } catch { return 'grid' }
  })

  function chooseView(v: ViewMode) {
    setView(v)
    try { localStorage.setItem(VIEW_KEY, v) } catch { /* ignore */ }
  }

  const works = repo.worksForUser(db.current_user_id)
  const needsYou = repo.worksNeedingApprovalFrom(me.id)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return works.filter((w) => {
      if (type !== 'all' && w.type !== type) return false
      if (!query) return true
      if (w.primary_title.toLowerCase().includes(query)) return true
      return repo.akasFor(w.id).some((a) => a.title.toLowerCase().includes(query))
    })
  }, [works, q, type, db])

  const agreed = works.filter((w) => w.agreement_status === 'confirmed').length
  const inProgress = works.filter((w) => w.agreement_status === 'pending').length

  return (
    <div>
      {needsYou.length > 0 && <NeedsYouLane items={needsYou} onOpen={(id) => navigate(`/app/work/${id}`)} />}

      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Your catalog</h1>
          <p className="mt-0.5 text-sm text-ink-faint">
            {works.length} {works.length === 1 ? 'work' : 'works'}
            {agreed > 0 && <> · {agreed} fully agreed</>}
            {inProgress > 0 && <> · {inProgress} in progress</>}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/app/new')} className="hidden sm:inline-flex">
          <IconPlus size={17} /> Log a work
        </Button>
      </div>

      {/* Search + filters + view toggle */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <IconSearch size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search titles, AKAs, people…" className="input pl-10" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          <FilterChip active={type === 'all'} onClick={() => setType('all')} label="All" />
          {workTypes.map((t) => {
            const Icon = workTypeIcon[t]
            return <FilterChip key={t} active={type === t} onClick={() => setType(t)} label={<><Icon size={14} /> {workTypeLabel[t]}</>} />
          })}
          <div className="ml-auto flex shrink-0 rounded-sm border border-line">
            <ViewButton active={view === 'list'} onClick={() => chooseView('list')} label="List view"><IconRows size={17} /></ViewButton>
            <ViewButton active={view === 'grid'} onClick={() => chooseView('grid')} label="Grid view"><IconGrid size={17} /></ViewButton>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        works.length === 0 ? (
          <EmptyState
            icon={<IconStack size={34} />}
            title="Log the session before you forget who was in it."
            body="Create your first sample, beat or song and add the people who were on it."
            action={<Button variant="primary" onClick={() => navigate('/app/new')}><IconPlus size={16} /> Log a work</Button>}
          />
        ) : (
          <EmptyState icon={<IconSearch size={34} />} title="No matches" body="Try a different title, AKA or type filter." />
        )
      ) : view === 'list' ? (
        <>
          <div className="card">
            <WorkTableHeader />
            {filtered.map((w) => (
              <WorkRow key={w.id} work={w} />
            ))}
          </div>
          <SplitLegend className="mt-4 border border-line-soft bg-bg-soft px-4 py-3" />
        </>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((w) => (
              <WorkCard key={w.id} work={w} />
            ))}
          </div>
          <SplitLegend className="mt-4 border border-line-soft bg-bg-soft px-4 py-3" />
        </>
      )}
    </div>
  )
}

// ── "Needs you" lane (diagnosis 2: one clear lane, everything else recedes) ───
function NeedsYouLane({ items, onOpen }: { items: repo.PendingForUser[]; onOpen: (workId: string) => void }) {
  const n = items.length
  return (
    <div className="mb-6 border border-brand/45 bg-[linear-gradient(#150d0f,#101014)] p-4 sm:p-[18px]">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-sm bg-brand text-white"><IconAlert size={13} /></span>
        <span className="text-[13px] font-bold text-ink">{n === 1 ? '1 change is' : `${n} changes are`} waiting on you</span>
        <span className="text-xs text-ink-soft">— nothing moves until you approve</span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((it) => {
          const who = it.proposer?.display_name ?? 'Someone'
          const ask = it.myShare
            ? `${who} wants to add you as ${it.myShare.role} at ${pct(it.myShare.split_percent)}`
            : `${who} proposed a new split`
          return (
            <div key={it.work.id} className="flex items-center gap-3 border border-line bg-bg-card px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-ink">{it.work.primary_title}</div>
                <div className="mt-0.5 text-[12.5px] text-ink-soft">
                  {ask} · asked {relTime(it.proposal.created_at)}
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={() => onOpen(it.work.id)} className="shrink-0">
                Review &amp; approve <IconArrowRight size={15} />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ViewButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-[42px] w-[42px] place-items-center transition ${
        active ? 'bg-brand text-white' : 'bg-bg-soft text-ink-faint hover:bg-bg-hover hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-3 py-2.5 text-sm font-medium transition ${
        active ? 'border-brand bg-brand/15 text-brand-soft' : 'border-line bg-bg-soft text-ink-soft hover:bg-bg-hover'
      }`}
    >
      {label}
    </button>
  )
}
