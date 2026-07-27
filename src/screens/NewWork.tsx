import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { roles, workTypes } from '@/data/schema'
import type { Role, WorkType } from '@/data/schema'
import { Avatar, Button, Card, Field, useToast } from '@/components/ui'
import { IconArrowLeft, IconCheck, IconPlus, IconX, workTypeIcon } from '@/components/icons'
import { evenSplits } from '@/lib/splits'
import { pct, workTypeLabel } from '@/lib/format'

type Member = { key: string; user_id: string | null; contact_id: string | null; name: string; hue: number; account: boolean; role: Role }

export default function NewWork() {
  const db = useDb()
  const navigate = useNavigate()
  const toast = useToast()
  const me = repo.currentUser()

  const [type, setType] = useState<WorkType>('sample')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [members, setMembers] = useState<Member[]>([
    { key: me.id, user_id: me.id, contact_id: null, name: me.display_name, hue: me.avatar_hue, account: true, role: 'Producer' },
  ])
  const [picking, setPicking] = useState(false)

  const dir = repo.directoryFor(me.id)
  const splits = evenSplits(members.length)

  function addUser(uid: string) {
    const u = db.users.find((x) => x.id === uid)!
    if (members.some((m) => m.user_id === uid)) return
    setMembers((m) => [...m, { key: uid, user_id: uid, contact_id: null, name: u.display_name, hue: u.avatar_hue, account: true, role: 'Producer' }])
  }
  function addContact(cid: string) {
    const c = db.contacts.find((x) => x.id === cid)!
    if (members.some((m) => m.contact_id === cid)) return
    setMembers((m) => [...m, { key: cid, user_id: null, contact_id: cid, name: c.display_name, hue: c.avatar_hue ?? 160, account: false, role: 'Producer' }])
  }
  function remove(key: string) {
    setMembers((m) => m.filter((x) => x.key !== key))
  }
  function setRole(key: string, role: Role) {
    setMembers((m) => m.map((x) => (x.key === key ? { ...x, role } : x)))
  }

  function submit() {
    if (!title.trim()) {
      toast('Give the work a title.', 'bad')
      return
    }
    if (members.length === 0) {
      toast('Add at least one contributor.', 'bad')
      return
    }
    const work = repo.createWork({
      type,
      primary_title: title.trim(),
      notes,
      members: members.map((m) => ({ user_id: m.user_id, contact_id: m.contact_id, role: m.role })),
    })
    toast('Work created', 'ok')
    navigate(`/app/work/${work.id}`)
  }

  const available = [
    ...dir.users.filter((u) => !members.some((m) => m.user_id === u.id)).map((u) => ({ kind: 'user' as const, id: u.id, name: u.display_name, hue: u.avatar_hue, sub: u.pro_name, account: true })),
    ...dir.contacts.filter((c) => !members.some((m) => m.contact_id === c.id)).map((c) => ({ kind: 'contact' as const, id: c.id, name: c.display_name, hue: c.avatar_hue ?? 160, sub: 'local contact', account: false })),
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink">
        <IconArrowLeft size={16} /> Back
      </button>
      <h1 className="text-2xl font-extrabold tracking-tight">New work</h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">Add who was on it. Splits start even and stay locked until everyone agrees to a change.</p>

      <div className="space-y-5">
        {/* Type */}
        <div>
          <span className="label">Type</span>
          <div className="grid grid-cols-3 gap-2">
            {workTypes.map((t) => {
              const Icon = workTypeIcon[t]
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex flex-col items-center gap-2 border py-5 transition ${
                    type === t ? 'border-brand bg-brand/10 text-ink' : 'border-line bg-bg-soft text-ink-soft hover:bg-bg-hover'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-sm font-semibold">{workTypeLabel[t]}</span>
                </button>
              )
            })}
          </div>
        </div>

        <Field label="Primary title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Velvet Static" className="input" autoFocus />
        </Field>

        <Field label="Notes" hint="BPM, key, vibe, where it lives — optional.">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="74 BPM · F#m · warm rhodes loop" className="input resize-none" />
        </Field>

        {/* Roster */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label mb-0">Roster & splits</span>
            <span className="text-xs text-ink-faint">Even split · {members.length ? pct(splits[0]) : '—'} each</span>
          </div>
          <Card className="divide-y divide-line">
            {members.map((m, i) => (
              <div key={m.key} className="flex items-center gap-3 p-3">
                <Avatar name={m.name} hue={m.hue} size={38} account={m.account} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 truncate font-semibold">
                    {m.name}
                    {m.user_id === me.id && <span className="text-xs font-normal text-ink-faint">(you)</span>}
                  </div>
                  <select
                    value={m.role}
                    onChange={(e) => setRole(m.key, e.target.value as Role)}
                    className="mt-1 rounded-sm border border-line bg-bg-soft px-2 py-1 text-xs text-ink-soft outline-none focus:border-brand"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <span className="font-mono text-sm text-ink-soft">{pct(splits[i])}</span>
                {members.length > 1 && (
                  <button onClick={() => remove(m.key)} className="rounded-sm p-1.5 text-ink-faint hover:bg-bg-hover hover:text-bad">
                    <IconX size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setPicking((p) => !p)}
              className="flex w-full items-center gap-2 p-3 text-sm font-medium text-brand-soft hover:bg-bg-hover"
            >
              <IconPlus size={16} /> Add collaborator
            </button>
            {picking && (
              <div className="bg-bg-soft/50 p-2">
                {available.length === 0 ? (
                  <p className="p-3 text-center text-sm text-ink-faint">
                    Everyone's added. Create contacts in the Collaborators tab.
                  </p>
                ) : (
                  <div className="max-h-56 space-y-1 overflow-y-auto">
                    {available.map((a) => (
                      <button
                        key={a.kind + a.id}
                        onClick={() => {
                          a.kind === 'user' ? addUser(a.id) : addContact(a.id)
                          setPicking(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-sm p-2.5 text-left hover:bg-bg-hover"
                      >
                        <Avatar name={a.name} hue={a.hue} size={32} account={a.account} />
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{a.name}</div>
                          <div className="text-xs text-ink-faint">{a.sub}</div>
                        </div>
                        <IconPlus size={16} className="text-ink-faint" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="primary" size="lg" onClick={submit} className="flex-1">
            <IconCheck size={18} /> Create work
          </Button>
        </div>
      </div>
    </div>
  )
}
