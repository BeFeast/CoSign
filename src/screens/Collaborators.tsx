import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { Avatar, Badge, Button, EmptyState, Field, Modal, useToast } from '@/components/ui'
import { IconPlus, IconSearch, IconUsers } from '@/components/icons'

export default function Collaborators() {
  useDb() // subscribe to store changes
  const navigate = useNavigate()
  const toast = useToast()
  const me = repo.currentUser()
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)

  const { users, contacts } = repo.directoryFor(me.id)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    const match = (name: string) => !query || name.toLowerCase().includes(query)
    return {
      users: users.filter((u) => match(u.display_name)),
      contacts: contacts.filter((c) => match(c.display_name)),
    }
  }, [users, contacts, q])

  const total = filtered.users.length + filtered.contacts.length

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Collaborators</h1>
          <p className="mt-0.5 text-sm text-ink-soft">{users.length} on CoSign · {contacts.length} local {contacts.length === 1 ? 'contact' : 'contacts'}</p>
        </div>
        <Button variant="primary" onClick={() => setAdding(true)} className="hidden sm:inline-flex">
          <IconPlus size={17} /> Add contact
        </Button>
      </div>

      <div className="relative mb-5">
        <IconSearch size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search directory…" className="input pl-10" />
      </div>

      {total === 0 ? (
        <EmptyState
          icon={<IconUsers size={34} />}
          title="No collaborators yet"
          body="Add a local contact for anyone not on CoSign — you can still put them on works."
          action={<Button variant="primary" onClick={() => setAdding(true)}><IconPlus size={16} /> Add contact</Button>}
        />
      ) : (
        <div className="space-y-6">
          {filtered.users.length > 0 && (
            <Section title="On CoSign">
              {filtered.users.map((u) => (
                <PersonRow key={u.id} name={u.display_name} hue={u.avatar_hue} account sub={`${u.pro_name}${u.pro_ipi ? ` · IPI ${u.pro_ipi}` : ''}`} onClick={() => navigate(`/app/collaborators/${u.id}`)} />
              ))}
            </Section>
          )}
          {filtered.contacts.length > 0 && (
            <Section title="Local contacts">
              {filtered.contacts.map((c) => (
                <PersonRow key={c.id} name={c.display_name} hue={c.avatar_hue ?? 160} account={false} sub={c.contact_email || 'no email'} onClick={() => navigate(`/app/collaborators/${c.id}`)} />
              ))}
            </Section>
          )}
        </div>
      )}

      <button
        onClick={() => setAdding(true)}
        className="fixed bottom-20 right-5 z-20 grid h-14 w-14 place-items-center rounded-sm bg-brand text-white shadow-xl shadow-brand/15 transition active:scale-95 sm:hidden"
      >
        <IconPlus size={24} />
      </button>

      <AddContactModal open={adding} onClose={() => setAdding(false)} onDone={() => toast('Contact added', 'ok')} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">{title}</h2>
      <div className="card divide-y divide-line">{children}</div>
    </div>
  )
}

function PersonRow({ name, hue, account, sub, onClick }: { name: string; hue: number; account: boolean; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-bg-hover first:rounded-t-sm last:rounded-b-sm">
      <Avatar name={name} hue={hue} size={40} account={account} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-semibold">
          {name}
          {!account && <Badge tone="warn">Local</Badge>}
        </div>
        <div className="truncate text-xs text-ink-faint">{sub}</div>
      </div>
    </button>
  )
}

function AddContactModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pro, setPro] = useState('')
  const [ipi, setIpi] = useState('')
  const [invite, setInvite] = useState(false)
  const toast = useToast()

  function reset() {
    setName(''); setEmail(''); setPro(''); setIpi(''); setInvite(false)
  }
  function submit() {
    if (!name.trim()) { toast('Name is required.', 'bad'); return }
    const c = repo.createContact({ display_name: name.trim(), contact_email: email.trim(), pro_name: pro.trim(), pro_ipi: ipi.trim() })
    if (invite && email.trim()) repo.inviteByEmail(email.trim(), c.id, null)
    reset()
    onClose()
    onDone()
  }
  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Add local contact">
      <p className="mb-4 text-sm text-ink-soft">For collaborators not on CoSign yet. You can put them on works and optionally invite them.</p>
      <div className="space-y-3.5">
        <Field label="Display name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Zed" className="input" autoFocus /></Field>
        <Field label="Email" hint="Optional — needed to send an invite."><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="zed@example.com" className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="PRO"><input value={pro} onChange={(e) => setPro(e.target.value)} placeholder="BMI" className="input" /></Field>
          <Field label="IPI / CAE"><input value={ipi} onChange={(e) => setIpi(e.target.value)} placeholder="000…" className="input" /></Field>
        </div>
        {email.trim() && (
          <label className="flex items-center gap-2.5 rounded-sm border border-line bg-bg-soft p-3 text-sm">
            <input type="checkbox" checked={invite} onChange={(e) => setInvite(e.target.checked)} className="h-4 w-4 accent-brand" />
            Send an invite to join CoSign
          </label>
        )}
      </div>
      <div className="mt-5 flex gap-2">
        <Button variant="ghost" onClick={() => { reset(); onClose() }} className="flex-1">Cancel</Button>
        <Button variant="primary" onClick={submit} className="flex-1">Add contact</Button>
      </div>
    </Modal>
  )
}
