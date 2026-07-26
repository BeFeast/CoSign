import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { Avatar, Badge, Button, Card, EmptyState, Field, Modal, Tabs, useToast } from '@/components/ui'
import { AgreementBadge, ConfirmDot, WorkTypeBadge } from '@/components/work-bits'
import { IconArrowLeft, IconCheck, IconClock, IconEdit, IconExternal, IconLink, IconPlus, IconShare, IconTrash, IconX, workTypeIcon } from '@/components/icons'
import { fullDate, pct, relTime, workTypeLabel } from '@/lib/format'
import { ProposeModal } from './work/ProposeModal'
import { ShareModal } from './work/ShareModal'

export default function WorkDetail() {
  const { id } = useParams()
  useDb() // subscribe to store changes
  const navigate = useNavigate()
  const me = repo.currentUser()
  const [tab, setTab] = useState('roster')

  const work = id ? repo.getWork(id) : null

  // Access control (PRD §6): only contributors can view a work.
  if (!work) return <Missing onBack={() => navigate('/app')} label="This work doesn't exist." />
  if (!repo.userCanAccessWork(me.id, work.id)) {
    return <Missing onBack={() => navigate('/app')} label="You're not on this work, so you can't view it." />
  }

  const roster = repo.rosterFor(work.id)
  const akas = repo.akasFor(work.id)
  const events = repo.eventsFor(work.id)
  const proposal = repo.openProposalFor(work.id)

  const tabs = [
    { key: 'roster', label: 'Roster & splits' },
    { key: 'titles', label: 'Titles', badge: akas.length || undefined },
    { key: 'lineage', label: 'Lineage' },
    { key: 'activity', label: 'Activity', badge: events.length || undefined },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={() => navigate('/app')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink">
        <IconArrowLeft size={16} /> Library
      </button>

      <WorkHeader work={work} />

      {proposal && <ProposalBanner workId={work.id} />}

      <div className="mt-6">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div className="pt-5">
          {tab === 'roster' && <RosterTab workId={work.id} />}
          {tab === 'titles' && <TitlesTab workId={work.id} />}
          {tab === 'lineage' && <LineageTab workId={work.id} />}
          {tab === 'activity' && <ActivityTab workId={work.id} />}
        </div>
      </div>
      <div className="h-4" />
      {/* keep roster referenced for header count */}
      <span className="hidden">{roster.length}</span>
    </div>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────
function WorkHeader({ work }: { work: ReturnType<typeof repo.getWork> & {} }) {
  const [renaming, setRenaming] = useState(false)
  const [sharing, setSharing] = useState(false)
  const toast = useToast()
  const me = repo.currentUser()
  const [title, setTitle] = useState(work.primary_title)

  function saveTitle() {
    repo.renameWork(work.id, title)
    setRenaming(false)
    toast('Renamed — old title kept as AKA', 'ok')
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <WorkTypeBadge type={work.type} />
        <AgreementBadge status={work.agreement_status} />
      </div>
      <div className="flex items-start justify-between gap-3">
        {renaming ? (
          <div className="flex flex-1 items-center gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input text-xl font-bold" autoFocus onKeyDown={(e) => e.key === 'Enter' && saveTitle()} />
            <Button variant="primary" size="sm" onClick={saveTitle}><IconCheck size={15} /></Button>
            <Button variant="ghost" size="sm" onClick={() => { setTitle(work.primary_title); setRenaming(false) }}><IconX size={15} /></Button>
          </div>
        ) : (
          <h1 className="group flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            {work.primary_title}
            <button onClick={() => setRenaming(true)} className="text-ink-faint opacity-0 transition group-hover:opacity-100 hover:text-ink" title="Rename (keeps old title as AKA)">
              <IconEdit size={17} />
            </button>
          </h1>
        )}
      </div>
      {work.notes && <p className="mt-2 text-sm text-ink-soft">{work.notes}</p>}
      <NotesEditor work={work} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="primary" size="sm" onClick={() => setSharing(true)}><IconShare size={15} /> Share credit pack</Button>
      </div>
      <p className="mt-3 text-xs text-ink-faint">Created by {repo.getUser(work.created_by)?.display_name ?? 'someone'} · {fullDate(work.created_at)} · updated {relTime(work.updated_at)}</p>

      <ShareModal open={sharing} onClose={() => setSharing(false)} workId={work.id} />
      <span className="hidden">{me.id}</span>
    </Card>
  )
}

function NotesEditor({ work }: { work: ReturnType<typeof repo.getWork> & {} }) {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(work.notes)
  const links = repo.linksFor(work.id)
  const [addingLink, setAddingLink] = useState(false)
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const toast = useToast()

  return (
    <div className="mt-3">
      {/* Links */}
      <div className="flex flex-wrap items-center gap-2">
        {links.map((l) => (
          <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="chip border border-line bg-bg-soft text-ink-soft hover:bg-bg-hover">
            <IconLink size={13} /> {l.label} <IconExternal size={12} />
          </a>
        ))}
        <button onClick={() => setAddingLink((v) => !v)} className="chip border border-dashed border-line text-ink-faint hover:text-ink">
          <IconPlus size={13} /> Link
        </button>
      </div>
      {addingLink && (
        <div className="mt-2 flex flex-wrap gap-2">
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (BeatStars)" className="input flex-1" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="input flex-1" />
          <Button variant="secondary" size="sm" onClick={() => {
            if (!label.trim() || !url.trim()) { toast('Label and URL needed', 'bad'); return }
            repo.addLink(work.id, label, url); setLabel(''); setUrl(''); setAddingLink(false)
          }}>Add</Button>
        </div>
      )}
      {editing ? (
        <div className="mt-3">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input resize-none" />
          <div className="mt-2 flex gap-2">
            <Button variant="primary" size="sm" onClick={() => { repo.updateWorkNotes(work.id, notes); setEditing(false); toast('Notes saved', 'ok') }}>Save</Button>
            <Button variant="ghost" size="sm" onClick={() => { setNotes(work.notes); setEditing(false) }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="mt-2 text-xs text-ink-faint hover:text-ink">
          {work.notes ? 'Edit notes' : '+ Add notes'}
        </button>
      )}
    </div>
  )
}

// ── Proposal banner + co-sign flow ───────────────────────────────────────────
function ProposalBanner({ workId }: { workId: string }) {
  const db = useDb()
  const me = repo.currentUser()
  const toast = useToast()
  const proposal = repo.openProposalFor(workId)
  if (!proposal) return null

  const votes = repo.votesFor(proposal.id)
  const myVote = votes.find((v) => v.voter_user_id === me.id)
  const proposer = repo.getUser(proposal.proposed_by)

  // affected account holders = current roster account users + newly added account users
  const affected = new Set<string>()
  for (const c of repo.contributionsFor(workId)) if (c.user_id) affected.add(c.user_id)
  for (const m of proposal.payload) if (m.user_id) affected.add(m.user_id)
  const affectedList = [...affected]
  const approvals = new Set(votes.filter((v) => v.vote === 'approve').map((v) => v.voter_user_id))
  const isAffected = affected.has(me.id)
  const isProposer = proposal.proposed_by === me.id

  return (
    <Card className="mt-4 border-warn/30 bg-warn/5 p-4">
      <div className="flex items-center gap-2">
        <IconClock size={18} className="text-warn" />
        <h3 className="font-bold text-warn">Splits changed — waiting on co-signs</h3>
      </div>
      {proposal.summary && <p className="mt-1.5 text-sm text-ink-soft">{proposal.summary}</p>}
      <p className="mt-1 text-xs text-ink-faint">Proposed by {proposer?.display_name} · {relTime(proposal.created_at)}</p>

      {/* proposed roster */}
      <div className="mt-3 space-y-1.5">
        {proposal.payload.map((m, i) => {
          const name = m.user_id ? repo.getUser(m.user_id)?.display_name : m.contact_id ? repo.getContact(m.contact_id)?.display_name : 'Unknown'
          const isNew = !m.contribution_id
          return (
            <div key={i} className="flex items-center justify-between rounded-sm bg-bg-soft px-3 py-2 text-sm">
              <span className="flex items-center gap-2">
                {name} <span className="text-ink-faint">· {m.role}</span>
                {isNew && <Badge tone="brand">new</Badge>}
              </span>
              <span className="font-mono">{pct(m.split_percent)}</span>
            </div>
          )
        })}
      </div>

      {/* co-sign progress */}
      <div className="mt-3">
        <div className="mb-1.5 text-xs font-medium text-ink-soft">Co-signs ({approvals.size}/{affectedList.length})</div>
        <div className="flex flex-wrap gap-2">
          {affectedList.map((uid) => {
            const u = repo.getUser(uid)!
            const approved = approvals.has(uid)
            return (
              <span key={uid} className={`chip border ${approved ? 'border-ok/30 bg-ok/10 text-ok' : 'border-line bg-bg-soft text-ink-faint'}`}>
                <Avatar name={u.display_name} hue={u.avatar_hue} size={18} />
                {u.display_name} {approved ? <IconCheck size={13} /> : '· pending'}
              </span>
            )
          })}
        </div>
      </div>

      {/* actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {isAffected && !myVote && (
          <>
            <Button variant="primary" onClick={() => { repo.voteOnProposal(proposal.id, 'approve'); toast('You co-signed', 'ok') }}>
              <IconCheck size={17} /> Co-sign this
            </Button>
            <Button variant="danger" onClick={() => { repo.voteOnProposal(proposal.id, 'reject'); toast('Proposal rejected', 'neutral') }}>
              <IconX size={17} /> Reject
            </Button>
          </>
        )}
        {isAffected && myVote && (
          <Badge tone={myVote.vote === 'approve' ? 'ok' : 'bad'}>You {myVote.vote === 'approve' ? 'co-signed' : 'rejected'} this</Badge>
        )}
        {!isAffected && <Badge tone="neutral">You're not required to co-sign</Badge>}
        {isProposer && (
          <Button variant="ghost" onClick={() => { repo.cancelProposal(proposal.id); toast('Proposal cancelled', 'neutral') }}>
            Cancel proposal
          </Button>
        )}
      </div>
      <span className="hidden">{db.current_user_id}</span>
    </Card>
  )
}

// ── Roster tab ───────────────────────────────────────────────────────────────
function RosterTab({ workId }: { workId: string }) {
  const db = useDb()
  const me = repo.currentUser()
  const toast = useToast()
  const roster = repo.rosterFor(workId)
  const proposal = repo.openProposalFor(workId)
  const [proposing, setProposing] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null)

  const total = roster.reduce((a, r) => a + r.contribution.split_percent, 0)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-soft">Contributors ({roster.length})</h2>
        <Button variant="secondary" size="sm" onClick={() => setProposing(true)} disabled={!!proposal}>
          <IconEdit size={15} /> Propose change
        </Button>
      </div>

      <Card className="divide-y divide-line">
        {roster.map((r) => {
          const hue = r.person.kind === 'user' ? r.person.user.avatar_hue : r.person.contact.avatar_hue ?? 160
          const c = r.contribution
          return (
            <div key={c.id} className="flex items-center gap-3 p-3.5">
              <Avatar name={r.name} hue={hue} size={40} account={r.isAccount} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-semibold">
                  {r.name}
                  {c.user_id === me.id && <span className="text-xs font-normal text-ink-faint">(you)</span>}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-faint">
                  <ConfirmDot status={c.confirm_status} />
                  {c.role}
                  {c.confirm_status === 'awaiting_account' && <span className="text-warn">· awaiting account</span>}
                  {c.confirm_status === 'confirmed' && c.offline_confirmed_at && <span>· confirmed offline</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-semibold">{pct(c.split_percent)}</div>
                {!r.isAccount && c.confirm_status === 'awaiting_account' && (
                  <button onClick={() => setConfirmTarget(c.id)} className="text-xs text-brand-soft hover:underline">
                    Confirm offline
                  </button>
                )}
              </div>
            </div>
          )
        })}
        <div className="flex items-center justify-between px-3.5 py-2.5 text-sm">
          <span className="font-medium text-ink-soft">Total</span>
          <span className={`font-mono font-bold ${Math.round(total) === 100 ? 'text-ok' : 'text-bad'}`}>{pct(total)}</span>
        </div>
      </Card>

      <p className="mt-3 text-xs text-ink-faint">
        Names, notes and links can be edited by anyone on the work. Changing splits or who's on the roster needs everyone to co-sign.
      </p>

      {proposing && <ProposeModal open={proposing} onClose={() => setProposing(false)} workId={workId} />}
      {confirmTarget && <OfflineConfirmModal contributionId={confirmTarget} onClose={() => setConfirmTarget(null)} onDone={() => toast('Confirmed offline', 'ok')} />}
      <span className="hidden">{db.current_user_id}</span>
    </div>
  )
}

function OfflineConfirmModal({ contributionId, onClose, onDone }: { contributionId: string; onClose: () => void; onDone: () => void }) {
  const [note, setNote] = useState('')
  return (
    <Modal open onClose={onClose} title="Confirm offline">
      <p className="mb-4 text-sm text-ink-soft">
        This collaborator isn't on CoSign yet, so they can't co-sign in-app. Record that they agreed offline — this is timestamped and logged, but it's your word, not their digital signature.
      </p>
      <Field label="Note (optional)" hint="e.g. “agreed over DM 2026-07-24”">
        <input value={note} onChange={(e) => setNote(e.target.value)} className="input" autoFocus />
      </Field>
      <div className="mt-5 flex gap-2">
        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="primary" onClick={() => { repo.confirmOffline(contributionId, note); onClose(); onDone() }} className="flex-1">
          Mark confirmed
        </Button>
      </div>
    </Modal>
  )
}

// ── Titles / AKA tab ─────────────────────────────────────────────────────────
function TitlesTab({ workId }: { workId: string }) {
  const db = useDb()
  const work = repo.getWork(workId)!
  const akas = repo.akasFor(workId)
  const [adding, setAdding] = useState('')
  const toast = useToast()

  function add() {
    if (!adding.trim()) return
    repo.addAka(workId, adding)
    setAdding('')
    toast('AKA added', 'ok')
  }

  return (
    <div>
      <Card className="p-4">
        <div className="text-xs text-ink-faint">Primary title</div>
        <div className="text-lg font-bold">{work.primary_title}</div>
      </Card>

      <h2 className="mb-2 mt-5 text-sm font-semibold text-ink-soft">Also known as ({akas.length})</h2>
      <p className="mb-3 text-xs text-ink-faint">Project names, marketplace titles, release names — everything stays searchable.</p>

      {akas.length === 0 ? (
        <Card className="p-5 text-center text-sm text-ink-faint">No AKAs yet.</Card>
      ) : (
        <Card className="divide-y divide-line">
          {akas.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-ink-faint">added by {repo.getUser(a.added_by)?.display_name ?? 'someone'} · {relTime(a.created_at)}</div>
              </div>
              <button onClick={() => repo.removeAka(a.id)} className="rounded-sm p-1.5 text-ink-faint hover:bg-bg-hover hover:text-bad">
                <IconTrash size={16} />
              </button>
            </div>
          ))}
        </Card>
      )}

      <div className="mt-3 flex gap-2">
        <input value={adding} onChange={(e) => setAdding(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add an alternate title…" className="input" />
        <Button variant="secondary" onClick={add}><IconPlus size={16} /> Add</Button>
      </div>
      <span className="hidden">{db.current_user_id}</span>
    </div>
  )
}

// ── Lineage tab ──────────────────────────────────────────────────────────────
function LineageTab({ workId }: { workId: string }) {
  const db = useDb()
  const navigate = useNavigate()
  const me = repo.currentUser()
  const toast = useToast()
  const uses = repo.usesWorks(workId)
  const usedBy = repo.usedByWorks(workId)
  const [linking, setLinking] = useState(false)

  // works I can access that aren't this one and aren't already linked as parents
  const linkable = repo.worksForUser(me.id).filter((w) => w.id !== workId && !uses.some((u) => u.id === w.id))

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-soft">This work uses ({uses.length})</h2>
          <Button variant="secondary" size="sm" onClick={() => setLinking((v) => !v)}><IconPlus size={15} /> Link a source</Button>
        </div>
        {linking && (
          <Card className="mb-3 max-h-56 overflow-y-auto p-2">
            {linkable.length === 0 ? (
              <p className="p-3 text-center text-sm text-ink-faint">No other works to link.</p>
            ) : linkable.map((w) => (
              <button key={w.id} onClick={() => { repo.addLineageUses(workId, w.id); setLinking(false); toast('Lineage linked', 'ok') }}
                className="flex w-full items-center justify-between rounded-sm p-2.5 text-left hover:bg-bg-hover">
                <span className="font-medium">{w.primary_title}</span>
                <Badge tone="neutral">{workTypeLabel[w.type]}</Badge>
              </button>
            ))}
          </Card>
        )}
        {uses.length === 0 ? (
          <EmptyState title="No sources linked" body="If this work is built on another (e.g. a beat that uses a sample), link it so the lineage is clear." />
        ) : (
          <div className="space-y-2">
            {uses.map((w) => (
              <LineageRow key={w.id} title={w.primary_title} type={w.type} onOpen={() => navigate(`/app/work/${w.id}`)} onRemove={() => repo.removeLineage(workId, w.id)} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink-soft">Used by ({usedBy.length})</h2>
        {usedBy.length === 0 ? (
          <Card className="p-5 text-center text-sm text-ink-faint">Nothing downstream uses this yet.</Card>
        ) : (
          <div className="space-y-2">
            {usedBy.map((w) => (
              <LineageRow key={w.id} title={w.primary_title} type={w.type} onOpen={() => navigate(`/app/work/${w.id}`)} />
            ))}
          </div>
        )}
      </div>
      <span className="hidden">{db.current_user_id}</span>
    </div>
  )
}

function LineageRow({ title, type, onOpen, onRemove }: { title: string; type: 'sample' | 'beat' | 'song'; onOpen: () => void; onRemove?: () => void }) {
  const Icon = workTypeIcon[type]
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="grid h-9 w-9 shrink-0 place-items-center bg-bg-hover text-ink-soft"><Icon size={16} /></span>
        <div className="min-w-0">
          <div className="truncate font-semibold">{title}</div>
          <div className="text-xs text-ink-faint">{workTypeLabel[type]}</div>
        </div>
      </button>
      {onRemove && (
        <button onClick={onRemove} className="rounded-sm p-1.5 text-ink-faint hover:bg-bg-hover hover:text-bad"><IconTrash size={16} /></button>
      )}
    </Card>
  )
}

// ── Activity tab ─────────────────────────────────────────────────────────────
function ActivityTab({ workId }: { workId: string }) {
  const db = useDb()
  const events = repo.eventsFor(workId)
  return (
    <div>
      {events.length === 0 ? (
        <Card className="p-5 text-center text-sm text-ink-faint">No activity yet.</Card>
      ) : (
        <div className="relative space-y-4 pl-5">
          <div className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-line" />
          {events.map((e) => (
            <div key={e.id} className="relative">
              <span className="absolute -left-5 top-1 h-3.5 w-3.5 rounded-sm border-2 border-bg-card bg-brand/60" />
              <p className="text-sm text-ink">{e.message}</p>
              <p className="text-xs text-ink-faint">{relTime(e.created_at)}</p>
            </div>
          ))}
        </div>
      )}
      <span className="hidden">{db.current_user_id}</span>
    </div>
  )
}

function Missing({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-8 text-center">
        <p className="text-ink-soft">{label}</p>
        <Button variant="secondary" onClick={onBack} className="mt-4">Back to library</Button>
      </Card>
    </div>
  )
}
