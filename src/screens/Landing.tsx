import { useNavigate } from 'react-router-dom'
import { IconArrowRight, IconCheck, IconShare, IconStack, IconUsers } from '@/components/icons'

const features = [
  {
    icon: IconStack,
    title: 'Provenance by layer',
    body: 'Track who made the sample, who made the beat on top of it, and who wrote the song — as separate works with real lineage.',
  },
  {
    icon: IconCheck,
    title: 'Splits only change when everyone agrees',
    body: 'Default even splits. Any change to ownership needs every collaborator to approve. No silent 50/50 → 70/30.',
  },
  {
    icon: IconUsers,
    title: 'Rotating collab directory',
    body: 'Reusable people — CoSign users or local contacts you add for anyone not on the app yet.',
  },
  {
    icon: IconShare,
    title: 'Credit + PRO pack',
    body: 'When a label asks, share a clean read-only pack with roles, splits, PRO/IPI and lineage. No DM hunting.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="min-h-full">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-sm bg-brand font-extrabold text-white">C</span>
          <span className="text-lg font-extrabold tracking-tight">CoSign</span>
        </div>
        <button
          onClick={() => navigate('/app')}
          className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-bg-soft px-4 py-2 text-sm font-semibold transition hover:bg-bg-hover"
        >
          Open app <IconArrowRight size={16} />
        </button>
      </header>

      <section className="mx-auto max-w-5xl px-5 pb-10 pt-10 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="chip mb-5 border border-brand/30 bg-brand/10 text-brand-soft">
            For hybrid music creators
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            If you were on it,
            <br />
            <span className="text-brand-soft">co-sign it.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
            A collab ledger for samples, beats and songs. Who made what layer, under which names,
            with PRO info ready to send — and splits that only change when everyone agrees.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand/15 transition hover:bg-brand-soft active:scale-95"
            >
              Open the demo catalog <IconArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/app/new')}
              className="rounded-sm border border-line bg-bg-soft px-6 py-3.5 text-base font-semibold transition hover:bg-bg-hover"
            >
              Log a session
            </button>
          </div>
          <p className="mt-4 text-xs text-ink-faint">Loaded with a real sample → beat → clearance story. No signup.</p>
        </div>

        <div className="mt-16 grid gap-4 sm:mt-24 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-sm bg-brand/12 text-brand-soft">
                <f.icon size={22} />
              </div>
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 card overflow-hidden">
          <div className="grid gap-6 p-7 sm:grid-cols-3">
            {[
              ['1', 'Log the work', 'Add a sample, beat or song and pull collaborators from your directory.'],
              ['2', 'Set the roster', 'Even splits by default. Link lineage when a beat uses a sample.'],
              ['3', 'Send the pack', 'Share a credit + PRO pack link the moment a label or buyer asks.'],
            ].map(([n, t, b]) => (
              <div key={n}>
                <div className="mb-2 text-sm font-bold text-brand-soft">{n}</div>
                <div className="font-semibold">{t}</div>
                <div className="mt-1 text-sm text-ink-soft">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-5 py-6 text-sm text-ink-faint sm:flex-row">
          <span>CoSign — collabs confirmed, credits clear.</span>
          <span>Coordination tool, not a law firm.</span>
        </div>
      </footer>
    </div>
  )
}
