import { useEffect, useState } from 'react'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { Avatar, Button, Card, Field, useToast } from '@/components/ui'
import { IconCheck } from '@/components/icons'

export default function Profile() {
  const db = useDb()
  const toast = useToast()
  const me = db.users.find((u) => u.id === db.current_user_id)!
  const [f, setF] = useState({ ...me })
  const set = (k: keyof typeof f, v: string) => setF((prev) => ({ ...prev, [k]: v }))

  // reset local form when switching identity
  useEffect(() => setF({ ...me }), [me.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function save() {
    if (!f.display_name.trim()) { toast('Display name is required.', 'bad'); return }
    repo.updateUser(me.id, {
      display_name: f.display_name,
      legal_name: f.legal_name,
      pro_name: f.pro_name,
      pro_ipi: f.pro_ipi,
      publisher_name: f.publisher_name,
      publisher_ipi: f.publisher_ipi,
      contact_email: f.contact_email,
      contact_social: f.contact_social,
      notes: f.notes,
    })
    toast('Profile saved', 'ok')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Avatar name={me.display_name} hue={me.avatar_hue} size={56} />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Your rights wallet</h1>
          <p className="text-sm text-ink-soft">PRO & credit info shared on credit packs.</p>
        </div>
      </div>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink-soft">Identity</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Display name"><input value={f.display_name} onChange={(e) => set('display_name', e.target.value)} className="input" /></Field>
          <Field label="Legal name"><input value={f.legal_name} onChange={(e) => set('legal_name', e.target.value)} className="input" /></Field>
        </div>

        <h2 className="mb-3 mt-6 text-sm font-semibold text-ink-soft">Performing rights</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="PRO name" hint="ASCAP, BMI, PRS…"><input value={f.pro_name} onChange={(e) => set('pro_name', e.target.value)} className="input" /></Field>
          <Field label="IPI / CAE"><input value={f.pro_ipi} onChange={(e) => set('pro_ipi', e.target.value)} className="input" /></Field>
          <Field label="Publisher"><input value={f.publisher_name} onChange={(e) => set('publisher_name', e.target.value)} className="input" /></Field>
          <Field label="Publisher IPI"><input value={f.publisher_ipi} onChange={(e) => set('publisher_ipi', e.target.value)} className="input" /></Field>
        </div>

        <h2 className="mb-3 mt-6 text-sm font-semibold text-ink-soft">Contact</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact email"><input value={f.contact_email} onChange={(e) => set('contact_email', e.target.value)} className="input" /></Field>
          <Field label="Social"><input value={f.contact_social} onChange={(e) => set('contact_social', e.target.value)} className="input" /></Field>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={save}><IconCheck size={17} /> Save changes</Button>
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-ink-faint">
        Signed in as {me.display_name} (demo). Use the switcher up top to act as another collaborator.
      </p>
    </div>
  )
}
