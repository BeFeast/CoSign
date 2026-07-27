import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { Avatar, Badge, Button, Card, EmptyState, Field, Modal, Tabs, useToast } from '@/components/ui'
import { StatusPill, WorkTypeBadge } from '@/components/work-bits'
import { SplitBar, segsFromRoster } from '@/components/SplitBar'
import type { SplitSeg } from '@/components/SplitBar'
import { IconAlert, IconArrowLeft, IconArrowRight, IconCheck, IconEdit, IconExternal, IconLink, IconLock, IconPlus, IconShare, IconTrash, IconX, workTypeIcon } from '@/components/icons'
import { fullDate, pct, relTime, workTypeLabel } from '@/lib/format'
import { ProposeModal } from './work/ProposeModal'
import { ShareModal } from './work/ShareModal'

const SECTION: Record<'sample' | 'beat' | 'song', string> = { sample: 'Samples', beat: 'Beats', song: 'Songs' }

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
    { key: 'roster', label: 'People & splits' },
    { key: 'titles', label: 'Other titles', badge: akas.length || undefined },
    { key: 'lineage', label: "What it's built on" },
    { key: 'activity', label: 'History', badge: events.length || undefined },
  ]

  const uses = repo.usesWorks(work.id)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-xs text-ink-faint">
        <button onClick={() => navigate('/app')} className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink">
          <IconArrowLeft size={14} /> Catalog
        </button>
        <span>/</span>
        <span className="text-ink-soft">{SECTION[work.type]}</span>
        <span>/</span>
        <span className="truncate text-ink">{work.primary_title}</span>
        {uses.length > 0 && (
          <span className="ml-1 hidden items-center gap-1.5 sm:inline-flex">
            <span className="text-ink-dim">·</span> built on{' '}
            <button onClick={() => navigate(`/app/work/${uses[0].id}`)} className="border-b border-dashed border-line text-ink-soft hover:text-ink">
              {uses[0].primary_title}
            </button>
          </span>
        )}
      </div>

      <WorkHeader work={work} />

      {proposal && <ApprovalPanel workId={work.id} />}

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
        <StatusPill work={work} meId={me.id} />
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

// ── Approval panel (1c: the panel does the explaining) ────────────────────────
function ApprovalPanel({ workId }: { workId: string }) {
  const db = useDb()
  const me = repo.currentUser()
  const toast = useToast()
  const work = repo.getWork(workId)!
  const proposal = repo.openProposalFor(workId)
  if (!proposal) return null

  const votes = repo.votesFor(proposal.id)
  const myVote = votes.find((v) => v.voter_user_id === me.id)
  const proposer = repo.getUser(proposal.proposed_by)
  const affected = repo.affectedUsersFor(workId, proposal)
  const approvals = new Set(votes.filter((v) => v.vote === 'approve').map((v) => v.voter_user_id))
  const isAffected = affected.includes(me.id)
  const isProposer = proposal.proposed_by === me.id
  const myPct = proposal.payload.find((m) => m.user_id === me.id)?.split_percent

  const todaySegs = segsFromRoster(repo.rosterFor(workId), me.id)
  const proposedSegs: SplitSeg[] = proposal.payload.map((m) => {
    const name = m.user_id ? repo.getUser(m.user_id)?.display_name : m.contact_id ? repo.getContact(m.contact_id)?.display_name : 'Unknown'
    return { name: name ?? 'Unknown', pct: m.split_percent, isYou: m.user_id === me.id, status: 'agreed' }
  })

  return (
    <Card className="mt-5 border-brand/45 bg-[#0d0b0c]">
      {/* Heading */}
      <div className="flex items-start gap-3 border-b border-line p-4 sm:p-[18px]">
        <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-sm bg-brand text-white"><IconAlert size={14} /></span>
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight sm:text-[17px]">{proposer?.display_name ?? 'Someone'} wants to change who owns this {workTypeLabel[work.type].toLowerCase()}</h2>
          {proposal.summary && <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">“{proposal.summary}”</p>}
          <p className="mt-1 text-[13px] text-ink-faint">Everyone below has to agree before the split actually changes. Until then the old split stands.</p>
        </div>
      </div>

      {/* Before / after diff */}
      <div className="grid items-stretch gap-3 p-4 sm:grid-cols-[1fr_28px_1fr] sm:gap-0 sm:p-[18px]">
        <div className="border border-line bg-bg-soft p-3.5">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Split today</div>
          <SplitBar segments={todaySegs} showNames height={12} />
        </div>
        <div className="hidden place-items-center text-brand sm:grid"><IconArrowRight size={18} /></div>
        <div className="border border-brand/40 bg-[#150d0f] p-3.5">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-brand-soft">If everyone agrees</div>
          <SplitBar segments={proposedSegs} showNames height={12} />
        </div>
      </div>

      {/* Who has to agree — roll call */}
      <div className="px-4 pb-4 sm:px-[18px]">
        <div className="border border-line bg-bg-soft p-3.5 sm:px-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">Who has to agree</span>
            <span className="font-mono text-[11.5px] text-ink-soft">{approvals.size} of {affected.length}</span>
          </div>
          <div className="mb-3.5 flex h-1 gap-0.5">
            {affected.map((uid) => (
              <span key={uid} className="flex-1" style={{ background: approvals.has(uid) ? '#4cc79a' : '#2a2a31' }} />
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {affected.map((uid) => {
              const u = repo.getUser(uid)
              const agreed = approvals.has(uid)
              const isMe = uid === me.id
              return (
                <div key={uid} className="flex items-center gap-2.5">
                  {agreed ? (
                    <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-ok/15 text-ok"><IconCheck size={11} /></span>
                  ) : (
                    <span className={`h-[18px] w-[18px] rounded-full border ${isMe ? 'border-dashed border-brand' : 'border-line'}`} />
                  )}
                  <span className="text-[12.5px] font-medium text-ink">
                    {isMe ? 'You' : u?.display_name}
                    <span className="font-normal text-ink-faint">
                      {agreed ? ` — agreed ${relTime(votes.find((v) => v.voter_user_id === uid)?.created_at ?? proposal.created_at)}` : isMe ? <span className="text-brand-soft"> — your turn</span> : ' — not yet'}
                      {uid === proposal.proposed_by && agreed && ' (they proposed it)'}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 pb-4 sm:px-[18px]">
        {isAffected && !myVote && (
          <>
            <Button variant="primary" onClick={() => { repo.voteOnProposal(proposal.id, 'approve'); toast('You approved the change', 'ok') }}>
              <IconCheck size={16} /> I agree{myPct != null ? ` — ${pct(myPct)} is right` : ''}
            </Button>
            <Button variant="outline" onClick={() => toast(`Message ${proposer?.display_name ?? 'them'} — coming soon`, 'neutral')}>
              Ask {proposer?.display_name ?? 'them'} a question
            </Button>
            <button onClick={() => { repo.voteOnProposal(proposal.id, 'reject'); toast('You turned this down', 'neutral') }} className="px-1.5 text-[13px] font-medium text-ink-faint hover:text-ink">
              Turn it down
            </button>
          </>
        )}
        {isAffected && myVote && (
          <Badge tone={myVote.vote === 'approve' ? 'ok' : 'bad'}>You {myVote.vote === 'approve' ? 'agreed to' : 'turned down'} this change</Badge>
        )}
        {!isAffected && <Badge tone="neutral">You're not being asked to approve this</Badge>}
        {isProposer && (
          <button onClick={() => { repo.cancelProposal(proposal.id); toast('Request cancelled', 'neutral') }} className="px-1.5 text-[13px] font-medium text-ink-faint hover:text-ink">
            Cancel this request
          </button>
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
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-bold text-ink">Ownership</h2>
          {proposal && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-faint">
              <IconLock size={12} /> locked while a change is pending
            </span>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setProposing(true)} disabled={!!proposal}>
          <IconEdit size={15} /> Propose a change
        </Button>
      </div>

      <Card className="divide-y divide-line-soft">
        {roster.map((r) => {
          const hue = r.person.kind === 'user' ? r.person.user.avatar_hue : r.person.contact.avatar_hue ?? 160
          const c = r.contribution
          const isYou = c.user_id === me.id
          const agreed = c.confirm_status === 'confirmed'
          const fillCls = isYou && !agreed ? 'hatch-red' : !isYou && !agreed ? 'hatch' : ''
          const fillBg = isYou && agreed ? '#e63b3b' : !isYou && agreed ? '#55555f' : undefined
          return (
            <div key={c.id} className="flex items-center gap-3 p-3.5">
              <Avatar name={r.name} hue={hue} size={36} account={r.isAccount} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {isYou ? 'You' : r.name}
                </div>
                <div className="text-xs text-ink-faint">
                  {c.role}
                  {c.confirm_status === 'pending' && <span className="text-brand-soft"> · not agreed yet</span>}
                  {c.confirm_status === 'awaiting_account' && <span> · hasn't signed up</span>}
                  {agreed && c.offline_confirmed_at && <span> · confirmed offline</span>}
                </div>
              </div>
              <div className="hidden h-2 w-[150px] shrink-0 gap-0.5 sm:flex">
                <span className={fillCls} style={{ width: `${c.split_percent}%`, background: fillBg }} />
                <span style={{ width: `${100 - c.split_percent}%`, background: '#1d1d24' }} />
              </div>
              <div className="w-[72px] text-right">
                <div className="font-mono text-[15px] font-semibold">{pct(c.split_percent)}</div>
                {!r.isAccount && c.confirm_status === 'awaiting_account' && (
                  <button onClick={() => setConfirmTarget(c.id)} className="text-[11px] text-brand-soft hover:underline">
                    Confirm offline
                  </button>
                )}
              </div>
            </div>
          )
        })}
        <div className="flex items-center justify-between bg-bg-soft px-3.5 py-2.5 text-sm">
          <span className="font-medium text-ink-soft">Total</span>
          <span className={`inline-flex items-center gap-1.5 font-mono font-bold ${Math.round(total) === 100 ? 'text-ok' : 'text-bad'}`}>
            {Math.round(total) === 100 && <IconCheck size={13} />}{pct(total)}
          </span>
        </div>
      </Card>

      <p className="mt-3 text-[11.5px] leading-relaxed text-ink-faint">
        Titles, notes and links: anyone on the work can edit them, straight away.<br />
        Who's on the roster and who owns what: needs everyone's agreement — that's what a change request is for.
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
        This collaborator isn't on CoSign yet, so they can't approve changes in-app. Record that they agreed offline — this is timestamped and logged, but it's your word, not their signature.
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
