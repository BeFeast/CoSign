import { useState } from 'react'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { Button, Modal, useToast } from '@/components/ui'
import { IconCopy, IconExternal, IconShare, IconTrash } from '@/components/icons'
import { buildCreditPackText } from '@/lib/credit-pack'

export function ShareModal({ open, onClose, workId }: { open: boolean; onClose: () => void; workId: string }) {
  const db = useDb()
  const toast = useToast()
  const [tab, setTab] = useState<'link' | 'text'>('link')
  const links = repo.shareLinksFor(workId)
  const activeLink = links[0]

  const text = buildCreditPackText(workId)

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast(`${label} copied`, 'ok')
    } catch {
      toast('Copy failed — select manually', 'bad')
    }
  }

  const publicUrl = activeLink ? `${location.origin}/p/${activeLink.token}` : ''

  return (
    <Modal open={open} onClose={onClose} title="Share credit pack" wide>
      <p className="mb-4 text-sm text-ink-soft">
        A read-only snapshot for labels and buyers: titles, roster, roles, splits, PRO/IPI, lineage and confirmation status.
      </p>

      <div className="mb-4 flex gap-1 rounded-sm bg-bg-soft p-1">
        <button onClick={() => setTab('link')} className={`flex-1 rounded-sm py-2 text-sm font-medium transition ${tab === 'link' ? 'bg-bg-hover text-ink' : 'text-ink-faint'}`}>Share link</button>
        <button onClick={() => setTab('text')} className={`flex-1 rounded-sm py-2 text-sm font-medium transition ${tab === 'text' ? 'bg-bg-hover text-ink' : 'text-ink-faint'}`}>Plain text</button>
      </div>

      {tab === 'link' ? (
        <div>
          {activeLink ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-sm border border-line bg-bg-soft p-2.5">
                <input readOnly value={publicUrl} className="flex-1 bg-transparent px-1 text-sm text-ink-soft outline-none" onFocus={(e) => e.target.select()} />
                <Button variant="secondary" size="sm" onClick={() => copy(publicUrl, 'Link')}><IconCopy size={14} /> Copy</Button>
              </div>
              <div className="flex gap-2">
                <a href={publicUrl} target="_blank" rel="noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full"><IconExternal size={15} /> Open preview</Button>
                </a>
                <Button variant="danger" onClick={() => { repo.revokeShareLink(activeLink.id); toast('Link revoked', 'neutral') }}>
                  <IconTrash size={15} /> Revoke
                </Button>
              </div>
              <p className="text-xs text-ink-faint">Anyone with this link can view the credit pack — no login. Revoke anytime.</p>
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-line p-6 text-center">
              <p className="mb-4 text-sm text-ink-soft">No share link yet.</p>
              <Button variant="primary" onClick={() => { repo.createShareLink(workId); toast('Share link created', 'ok') }}>
                <IconShare size={16} /> Create share link
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-sm border border-line bg-bg-soft p-3.5 font-mono text-xs text-ink-soft">{text}</pre>
          <Button variant="primary" onClick={() => copy(text, 'Summary')} className="mt-3 w-full"><IconCopy size={16} /> Copy summary</Button>
        </div>
      )}
      <span className="hidden">{db.current_user_id}</span>
    </Modal>
  )
}
