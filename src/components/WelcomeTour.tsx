import { useEffect, useState } from 'react'
import { Button } from './ui'
import { IconArrowLeft, IconArrowRight, IconBeat, IconCheck, IconSong, IconStack, IconX } from './icons'

const TOUR_KEY = 'cosign.tour.v1'
const STRIP_KEY = 'cosign.onboard.library.v1' // keep in sync with Library.tsx

type Step = {
  eyebrow: string
  title: string
  body: string
  bullets?: { icon: (p: { size?: number }) => JSX.Element; text: string }[]
}

const STEPS: Step[] = [
  {
    eyebrow: 'What it is',
    title: 'Welcome to CoSign',
    body: 'A shared ledger for music made in layers — samples, beats and songs. It records who made which part, keeps everyone’s credit and PRO info in one place, and remembers every title a work has ever gone by.',
  },
  {
    eyebrow: 'Why it exists',
    title: 'Collabs move fast. Paperwork doesn’t.',
    body: 'Splits get agreed in a DM and forgotten. A 50/50 quietly becomes 70/30. The sample under the beat has no paper trail by the time a song needs clearing. CoSign was built to make ownership explicit and hard to change by accident — so credit and money land where they should.',
  },
  {
    eyebrow: 'How it works',
    title: 'Three steps',
    body: '',
    bullets: [
      { icon: IconStack, text: 'Log a work and add everyone who was on it.' },
      { icon: IconCheck, text: 'Splits start even and only change when every collaborator co-signs.' },
      { icon: IconSong, text: 'Share a clean credit + PRO pack as one link when it’s time to clear.' },
    ],
  },
  {
    eyebrow: 'This is a live demo',
    title: 'Play with a real story',
    body: 'It’s loaded with a sample → beat → song → clearance thread, and there’s no login. Use “Viewing as” in the top-right corner to step into any collaborator and co-sign a change from their side.',
  },
]

export default function WelcomeTour() {
  const [open, setOpen] = useState(false)
  const [i, setI] = useState(0)

  useEffect(() => {
    try {
      if (localStorage.getItem(TOUR_KEY) !== '1') setOpen(true)
    } catch {
      /* ignore */
    }
  }, [])

  function close(alsoHideStrip: boolean) {
    try {
      localStorage.setItem(TOUR_KEY, '1')
      if (alsoHideStrip) localStorage.setItem(STRIP_KEY, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  const step = STEPS[i]
  const last = i === STEPS.length - 1
  const Beat = IconBeat // decorative mark

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_.15s_ease]" onClick={() => close(false)} />
      <div className="card relative w-full max-w-lg animate-[slideUp_.2s_ease] p-6 sm:p-7">
        {/* header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center bg-brand text-sm font-extrabold text-white">C</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-soft">{step.eyebrow}</span>
          </div>
          <button onClick={() => close(false)} className="p-1.5 text-ink-faint transition hover:bg-bg-hover hover:text-ink" aria-label="Skip">
            <IconX size={18} />
          </button>
        </div>

        {/* body */}
        <h2 className="text-2xl font-extrabold tracking-tight">{step.title}</h2>
        {step.body && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{step.body}</p>}

        {step.bullets && (
          <ul className="mt-4 space-y-2.5">
            {step.bullets.map((b, bi) => (
              <li key={bi} className="flex items-start gap-3 border border-line bg-bg-soft p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center bg-bg-hover text-ink-soft">
                  <b.icon size={16} />
                </span>
                <span className="pt-1 text-sm text-ink">{b.text}</span>
              </li>
            ))}
          </ul>
        )}

        {!step.bullets && !step.body && <Beat size={24} />}

        {/* footer */}
        <div className="mt-7 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, di) => (
              <span key={di} className={`h-1.5 w-5 transition-colors ${di === i ? 'bg-brand' : 'bg-line'}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {i > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setI((n) => n - 1)}>
                <IconArrowLeft size={15} /> Back
              </Button>
            )}
            {last ? (
              <Button variant="primary" size="sm" onClick={() => close(true)}>
                Explore the catalog <IconArrowRight size={15} />
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => setI((n) => n + 1)}>
                Next <IconArrowRight size={15} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
