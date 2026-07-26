import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { Avatar, Badge, Button, Card, Field, Modal, useToast } from '@/components/ui'
import { IconArrowLeft, IconEdit } from '@/components/icons'
import { WorkCard } from '@/components/work-bits'
import { fullDate } from '@/lib/format'

export default function CollaboratorDetail() {
  const { id } = useParams()
  const db = useDb()
  const navigate = useNavigate()
  const me = repo.currentUser()
  const toast = useToast()
  const [editing, setEditing] = useState(false)

  const user = db.users.find((u) => u.id === id)
  const contact = db.contacts.find((c) => c.id === id)

  if (!user && !contact) {
    return <NotFound onBack={() => navigate('/app/collaborators')} />
  }

  const isContact = !!contact
  const canEdit = isContact && contact!.owner_user_id === me.id
  const p = user ?? contact!
  const hue = user ? user.avatar_hue : contact!.avatar_hue ?? 160

  // works in common: works I can see where this person is on the roster
  const myWorks = repo.worksForUser(me.id)
  const common = myWorks.filter((w) =>
    repo.contributionsFor(w.id).some((c) => (user ? c.user_id === user.id : c.contact_id === contact!.id)),
  )

  const fields: Array<[string, string]> = [
    ['Legal name', p.legal_name || '—'],
    ['PRO', p.pro_name || '—'],
    ['IPI / CAE', p.pro_ipi || '—'],
    ['Publisher', p.publisher_name || '—'],
    ['Publisher IPI', p.publisher_ipi || '—'],
    ['Contact email', p.contact_email || '—'],
    ['Social', p.contact_social || '—'],
  ]

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => navigate('/app/collaborators')} className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink">
        <IconArrowLeft size={16} /> Collaborators
      </button>

      <Card className="p-5">
        <div className="flex items-start gap-4">
          <Avatar name={p.display_name} hue={hue} size={56} account={!isContact} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold">{p.display_name}</h1>
              {isContact ? <Badge tone="warn">Local contact</Badge> : <Badge tone="ok">On CoSign</Badge>}
            </div>
            <p className="mt-0.5 text-sm text-ink-faint">Added {fullDate(p.created_at)}</p>
          </div>
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <IconEdit size={15} /> Edit
            </Button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
          {fields.map(([k, v]) => (
            <div key={k}>
              <div className="text-xs text-ink-faint">{k}</div>
              <div className="text-sm font-medium text-ink">{v}</div>
            </div>
          ))}
        </div>

        {isContact && (
          <p className="mt-5 rounded-sm border border-line bg-bg-soft p-3 text-xs text-ink-soft">
            Local contact — can be placed on works, but can't digitally co-sign until they join. You can confirm on their behalf offline from a work.
          </p>
        )}
      </Card>

      <h2 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        Works in common ({common.length})
      </h2>
      {common.length === 0 ? (
        <Card className="p-6 text-center text-sm text-ink-faint">No shared works yet.</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {common.map((w) => <WorkCard key={w.id} work={w} />)}
        </div>
      )}

      {canEdit && <EditContactModal open={editing} onClose={() => setEditing(false)} contactId={contact!.id} onSaved={() => toast('Saved', 'ok')} />}
    </div>
  )
}

function EditContactModal({ open, onClose, contactId, onSaved }: { open: boolean; onClose: () => void; contactId: string; onSaved: () => void }) {
  const db = useDb()
  const c = db.contacts.find((x) => x.id === contactId)!
  const [f, setF] = useState({ ...c })
  const set = (k: keyof typeof f, v: string) => setF((prev) => ({ ...prev, [k]: v }))

  function save() {
    repo.updateContact(contactId, {
      display_name: f.display_name,
      legal_name: f.legal_name,
      pro_name: f.pro_name,
      pro_ipi: f.pro_ipi,
      publisher_name: f.publisher_name,
      publisher_ipi: f.publisher_ipi,
      contact_email: f.contact_email,
      contact_social: f.contact_social,
    })
    onClose()
    onSaved()
  }
  return (
    <Modal open={open} onClose={onClose} title="Edit contact" wide>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Display name"><input value={f.display_name} onChange={(e) => set('display_name', e.target.value)} className="input" /></Field>
        <Field label="Legal name"><input value={f.legal_name} onChange={(e) => set('legal_name', e.target.value)} className="input" /></Field>
        <Field label="PRO"><input value={f.pro_name} onChange={(e) => set('pro_name', e.target.value)} className="input" /></Field>
        <Field label="IPI / CAE"><input value={f.pro_ipi} onChange={(e) => set('pro_ipi', e.target.value)} className="input" /></Field>
        <Field label="Publisher"><input value={f.publisher_name} onChange={(e) => set('publisher_name', e.target.value)} className="input" /></Field>
        <Field label="Publisher IPI"><input value={f.publisher_ipi} onChange={(e) => set('publisher_ipi', e.target.value)} className="input" /></Field>
        <Field label="Contact email"><input value={f.contact_email} onChange={(e) => set('contact_email', e.target.value)} className="input" /></Field>
        <Field label="Social"><input value={f.contact_social} onChange={(e) => set('contact_social', e.target.value)} className="input" /></Field>
      </div>
      <div className="mt-5 flex gap-2">
        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="primary" onClick={save} className="flex-1">Save</Button>
      </div>
    </Modal>
  )
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-8 text-center">
        <p className="text-ink-soft">Collaborator not found.</p>
        <Button variant="secondary" onClick={onBack} className="mt-4">Back to directory</Button>
      </Card>
    </div>
  )
}
