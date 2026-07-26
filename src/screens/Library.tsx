import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { workTypes } from '@/data/schema'
import type { WorkType } from '@/data/schema'
import { Button, EmptyState } from '@/components/ui'
import { IconCheck, IconGrid, IconPlus, IconRows, IconSearch, IconShare, IconStack, IconX, workTypeIcon } from '@/components/icons'
import { WorkCard, WorkRow } from '@/components/work-bits'
import { workTypeLabel } from '@/lib/format'

const ONBOARD_KEY = 'cosign.onboard.library.v1'
const VIEW_KEY = 'cosign.library.view'
type ViewMode = 'grid' | 'list'

export default function Library() {
  const db = useDb()
  const navigate = useNavigate()
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

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return works.filter((w) => {
      if (type !== 'all' && w.type !== type) return false
      if (!query) return true
      // search primary title AND AKAs (PRD §5.8)
      if (w.primary_title.toLowerCase().includes(query)) return true
      return repo.akasFor(w.id).some((a) => a.title.toLowerCase().includes(query))
    })
  }, [works, q, type, db])

  const pendingCount = works.filter((w) => w.agreement_status === 'pending').length

  return (
    <div>
      <HowItWorks onNew={() => navigate('/app/new')} />

      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Library</h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            {works.length} {works.length === 1 ? 'work' : 'works'}
            {pendingCount > 0 && <span className="text-warn"> · {pendingCount} waiting on co-signs</span>}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/app/new')} className="hidden sm:inline-flex">
          <IconPlus size={17} /> New work
        </Button>
      </div>

      {/* Search + filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <IconSearch size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search any title or AKA…"
            className="input pl-10"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          <FilterChip active={type === 'all'} onClick={() => setType('all')} label="All" />
          {workTypes.map((t) => {
            const Icon = workTypeIcon[t]
            return (
              <FilterChip key={t} active={type === t} onClick={() => setType(t)} label={<><Icon size={14} /> {workTypeLabel[t]}</>} />
            )
          })}
          <div className="ml-auto flex shrink-0 border border-line">
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
            action={<Button variant="primary" onClick={() => navigate('/app/new')}><IconPlus size={16} /> New work</Button>}
          />
        ) : (
          <EmptyState icon={<IconSearch size={34} />} title="No matches" body="Try a different title, AKA or type filter." />
        )
      ) : view === 'list' ? (
        <div className="space-y-2">
          {filtered.map((w) => (
            <WorkRow key={w.id} work={w} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((w) => (
            <WorkCard key={w.id} work={w} />
          ))}
        </div>
      )}
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

function HowItWorks({ onNew }: { onNew: () => void }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(ONBOARD_KEY) === '1' } catch { return false }
  })
  if (dismissed) return null

  function dismiss() {
    try { localStorage.setItem(ONBOARD_KEY, '1') } catch { /* ignore */ }
    setDismissed(true)
  }

  const steps = [
    { icon: IconStack, title: 'Log the work', body: 'Add a sample, beat or song and everyone who was on it.' },
    { icon: IconCheck, title: 'Splits stay locked', body: 'They start even and only change when every collaborator co-signs.' },
    { icon: IconShare, title: 'Share the credit pack', body: 'Send clean credits + PRO info in one link, ready for clearance.' },
  ]

  return (
    <div className="card relative mb-5 p-5">
      <button
        onClick={dismiss}
        className="absolute right-3 top-3 p-1.5 text-ink-faint transition hover:bg-bg-hover hover:text-ink"
        aria-label="Dismiss"
      >
        <IconX size={16} />
      </button>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-bold tracking-tight">How CoSign works</h2>
        <span className="chip border border-line bg-bg-soft text-[10px] uppercase tracking-wide text-ink-faint">Demo catalog loaded</span>
      </div>
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3 border border-line bg-bg-soft p-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center bg-bg-hover text-ink-soft">
              <s.icon size={16} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <span className="text-ink-faint">{i + 1}.</span> {s.title}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" size="sm" onClick={onNew}><IconPlus size={15} /> Log your first work</Button>
        <button onClick={dismiss} className="text-xs font-medium text-ink-faint hover:text-ink">Got it, hide this</button>
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-3 py-2.5 text-sm font-medium transition ${
        active ? 'border-brand bg-brand/15 text-brand-soft' : 'border-line bg-bg-soft text-ink-soft hover:bg-bg-hover'
      }`}
    >
      {label}
    </button>
  )
}
