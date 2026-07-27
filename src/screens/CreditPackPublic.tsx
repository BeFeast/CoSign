import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as repo from '@/data/repo'
import { Badge } from '@/components/ui'
import { IconCheck, IconCopy, IconLink } from '@/components/icons'
import { buildCreditPackText } from '@/lib/credit-pack'
import { fullDate, pct, workTypeLabel } from '@/lib/format'
import type { Contribution } from '@/data/schema'

function pro(c: Contribution) {
  const p = c.user_id ? repo.getUser(c.user_id) : c.contact_id ? repo.getContact(c.contact_id) : null
  return p
}

export default function CreditPackPublic() {
  const { token } = useParams()
  const [copied, setCopied] = useState(false)
  const link = token ? repo.shareLinkByToken(token) : null
  const work = link ? repo.getWork(link.work_id) : null

  if (!link || !work) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <div className="mb-3 flex justify-center text-ink-faint"><IconLink size={34} /></div>
          <h1 className="text-xl font-bold">Link not found</h1>
          <p className="mt-1 text-ink-soft">This credit pack link is invalid or was revoked.</p>
          <Link to="/" className="mt-4 inline-block text-brand-soft hover:underline">Go to CoSign →</Link>
        </div>
      </div>
    )
  }

  const roster = repo.rosterFor(work.id)
  const akas = repo.akasFor(work.id)
  const uses = repo.usesWorks(work.id)
  const links = repo.linksFor(work.id)

  async function copy() {
    try {
      await navigator.clipboard.writeText(buildCreditPackText(work!.id))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-brand text-sm font-extrabold text-white">C</span>
            <span className="font-extrabold tracking-tight">CoSign</span>
          </Link>
          <Badge tone="neutral">Read-only credit pack</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8">
        <div className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{workTypeLabel[work.type]}</Badge>
            {work.agreement_status === 'confirmed' ? <Badge tone="ok"><IconCheck size={12} /> Splits agreed</Badge> : <Badge tone="warn">Change pending approval</Badge>}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{work.primary_title}</h1>
          {akas.length > 0 && (
            <p className="mt-1.5 text-sm text-ink-soft">
              <span className="text-ink-faint">AKA:</span> {akas.map((a) => a.title).join(' · ')}
            </p>
          )}
          {uses.length > 0 && (
            <p className="mt-1 text-sm text-ink-soft">
              <span className="text-ink-faint">Uses / based on:</span> {uses.map((u) => `${u.primary_title} (${workTypeLabel[u.type]})`).join(', ')}
            </p>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink-soft">Roster, splits & rights</h2>
            <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-sm bg-bg-hover px-2.5 py-1.5 text-xs font-medium hover:bg-line">
              {copied ? <><IconCheck size={13} /> Copied</> : <><IconCopy size={13} /> Copy text</>}
            </button>
          </div>
          <div className="divide-y divide-line">
            {roster.map((r) => {
              const p = pro(r.contribution)
              const status = r.contribution.confirm_status
              return (
                <div key={r.contribution.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">{r.name}</div>
                    <div className="font-mono text-lg font-bold">{pct(r.contribution.split_percent)}</div>
                  </div>
                  <div className="mb-2 text-sm text-ink-soft">{r.contribution.role}
                    {status === 'confirmed' ? <span className="ml-2 text-ok">· confirmed</span> : status === 'awaiting_account' ? <span className="ml-2 text-ink-faint">· awaiting account</span> : <span className="ml-2 text-warn">· pending</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {p?.legal_name && <Meta k="Legal name" v={p.legal_name} />}
                    {p?.pro_name && <Meta k="PRO" v={p.pro_name} />}
                    {p?.pro_ipi && <Meta k="IPI / CAE" v={p.pro_ipi} />}
                    {p?.publisher_name && <Meta k="Publisher" v={p.publisher_name} />}
                    {p?.contact_email && <Meta k="Contact" v={p.contact_email} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {links.length > 0 && (
          <div className="mt-5">
            <h2 className="mb-2 text-sm font-semibold text-ink-soft">Links</h2>
            <div className="card divide-y divide-line">
              {links.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 text-sm hover:bg-bg-hover">
                  <span className="font-medium">{l.label}</span>
                  <span className="truncate text-ink-faint">{l.url}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-ink-faint">
          Generated by CoSign on {fullDate(link.created_at)} · coordination tool, not a law firm.
        </p>
      </main>
    </div>
  )
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="text-ink-faint">{k}: </span>
      <span className="font-medium text-ink">{v}</span>
    </div>
  )
}
