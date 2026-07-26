import { useState } from 'react'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { roles } from '@/data/schema'
import type { ProposalMember, Role } from '@/data/schema'
import { Avatar, Badge, Button, Field, Modal, useToast } from '@/components/ui'
import { IconPlus, IconX } from '@/components/icons'
import { evenSplits, sumSplits } from '@/lib/splits'
import { pct } from '@/lib/format'

type Row = {
  contribution_id: string | null
  user_id: string | null
  contact_id: string | null
  name: string
  hue: number
  account: boolean
  role: Role
  split: number
}

export function ProposeModal({ open, onClose, workId }: { open: boolean; onClose: () => void; workId: string }) {
  const db = useDb()
  const me = repo.currentUser()
  const toast = useToast()

  const initial: Row[] = repo.rosterFor(workId).map((r) => ({
    contribution_id: r.contribution.id,
    user_id: r.contribution.user_id ?? null,
    contact_id: r.contribution.contact_id ?? null,
    name: r.name,
    hue: r.person.kind === 'user' ? r.person.user.avatar_hue : r.person.contact.avatar_hue ?? 160,
    account: r.isAccount,
    role: r.contribution.role,
    split: r.contribution.split_percent,
  }))

  const [rows, setRows] = useState<Row[]>(initial)
  const [summary, setSummary] = useState('')
  const [picking, setPicking] = useState(false)

  const total = sumSplits(rows.map((r) => r.split))
  const valid = Math.abs(total - 100) < 0.001 && rows.length > 0

  function setSplit(i: number, v: string) {
    const n = Math.max(0, Math.min(100, parseFloat(v) || 0))
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, split: n } : r)))
  }
  function setRole(i: number, role: Role) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, role } : r)))
  }
  function remove(i: number) {
    setRows((rs) => rs.filter((_, idx) => idx !== i))
  }
  function rebalance() {
    const splits = evenSplits(rows.length)
    setRows((rs) => rs.map((r, i) => ({ ...r, split: splits[i] })))
  }
  function addUser(uid: string) {
    const u = db.users.find((x) => x.id === uid)!
    setRows((rs) => [...rs, { contribution_id: null, user_id: uid, contact_id: null, name: u.display_name, hue: u.avatar_hue, account: true, role: 'Producer', split: 0 }])
    setPicking(false)
  }
  function addContact(cid: string) {
    const c = db.contacts.find((x) => x.id === cid)!
    setRows((rs) => [...rs, { contribution_id: null, user_id: null, contact_id: cid, name: c.display_name, hue: c.avatar_hue ?? 160, account: false, role: 'Producer', split: 0 }])
    setPicking(false)
  }

  function submit() {
    if (!valid) { toast('Splits must total 100%.', 'bad'); return }
    const payload: ProposalMember[] = rows.map((r) => ({
      contribution_id: r.contribution_id,
      user_id: r.user_id,
      contact_id: r.contact_id,
      role: r.role,
      split_percent: r.split,
    }))
    try {
      repo.openProposal(workId, payload, summary.trim())
      onClose()
      toast('Proposal opened — collaborators notified', 'ok')
    } catch (e) {
      toast((e as Error).message, 'bad')
    }
  }

  const dir = repo.directoryFor(me.id)
  const available = [
    ...dir.users.filter((u) => !rows.some((r) => r.user_id === u.id)).map((u) => ({ kind: 'user' as const, id: u.id, name: u.display_name, hue: u.avatar_hue, account: true, sub: u.pro_name })),
    ...dir.contacts.filter((c) => !rows.some((r) => r.contact_id === c.id)).map((c) => ({ kind: 'contact' as const, id: c.id, name: c.display_name, hue: c.avatar_hue ?? 160, account: false, sub: 'local contact' })),
  ]

  return (
    <Modal open={open} onClose={onClose} title="Propose split / roster change" wide>
      <p className="mb-4 text-sm text-ink-soft">
        Every account holder on the roster must co-sign before this applies. Nothing changes until then.
      </p>

      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.contribution_id ?? r.user_id ?? r.contact_id ?? i} className="flex items-center gap-2.5 rounded-sm border border-line bg-bg-soft p-2.5">
            <Avatar name={r.name} hue={r.hue} size={34} account={r.account} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate text-sm font-semibold">
                {r.name}
                {!r.contribution_id && <Badge tone="brand">new</Badge>}
              </div>
              <select value={r.role} onChange={(e) => setRole(i, e.target.value as Role)} className="mt-0.5 rounded-sm border border-line bg-bg px-1.5 py-0.5 text-xs text-ink-soft outline-none focus:border-brand">
                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <input type="number" min={0} max={100} step="0.01" value={r.split} onChange={(e) => setSplit(i, e.target.value)} className="w-20 rounded-sm border border-line bg-bg px-2 py-1.5 text-right font-mono text-sm outline-none focus:border-brand" />
              <span className="text-sm text-ink-faint">%</span>
            </div>
            <button onClick={() => remove(i)} className="rounded-sm p-1.5 text-ink-faint hover:bg-bg-hover hover:text-bad"><IconX size={16} /></button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button onClick={() => setPicking((v) => !v)} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-soft hover:underline">
          <IconPlus size={15} /> Add contributor
        </button>
        <div className="flex items-center gap-3">
          <button onClick={rebalance} className="text-xs text-ink-faint hover:text-ink">Split evenly</button>
          <span className={`font-mono text-sm font-bold ${Math.abs(total - 100) < 0.001 ? 'text-ok' : 'text-bad'}`}>{pct(total)}</span>
        </div>
      </div>

      {picking && (
        <div className="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-sm border border-line bg-bg-soft p-2">
          {available.length === 0 ? (
            <p className="p-2 text-center text-sm text-ink-faint">Everyone's on. Add contacts in the Collaborators tab.</p>
          ) : available.map((a) => (
            <button key={a.kind + a.id} onClick={() => (a.kind === 'user' ? addUser(a.id) : addContact(a.id))} className="flex w-full items-center gap-2.5 rounded-sm p-2 text-left hover:bg-bg-hover">
              <Avatar name={a.name} hue={a.hue} size={28} account={a.account} />
              <div className="flex-1">
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-xs text-ink-faint">{a.sub}</div>
              </div>
              <IconPlus size={15} className="text-ink-faint" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        <Field label="What's changing? (optional)">
          <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="e.g. Add Zed as producer, rebalance to 40/30/30" className="input" />
        </Field>
      </div>

      <div className="mt-5 flex gap-2">
        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="primary" onClick={submit} disabled={!valid} className="flex-1">Open proposal</Button>
      </div>
    </Modal>
  )
}
