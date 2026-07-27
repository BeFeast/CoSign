import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconCheck, IconInfo, IconX } from './icons'

const TOUR_KEY = 'cosign.tour.v1'

// First run (1e): no carousel. One sentence of why, then a checklist that
// empties as the app gets used.
export default function WelcomeTour() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      if (localStorage.getItem(TOUR_KEY) !== '1') setOpen(true)
    } catch {
      /* ignore */
    }
  }, [])

  function close() {
    try { localStorage.setItem(TOUR_KEY, '1') } catch { /* ignore */ }
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_.15s_ease]" onClick={close} />
      <div className="card relative w-full max-w-lg animate-[slideUp_.2s_ease] p-6 sm:p-7">
        <button onClick={close} className="absolute right-4 top-4 rounded-sm p-1.5 text-ink-faint transition hover:bg-bg-hover hover:text-ink" aria-label="Close">
          <IconX size={18} />
        </button>

        <div className="mb-5 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-brand text-sm font-extrabold text-white">C</span>
          <span className="text-[17px] font-extrabold tracking-tight">CoSign</span>
        </div>

        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight">
          A 50/50 agreed in a DM<br />is not a 50/50.
        </h1>
        <p className="mt-3 max-w-[470px] text-sm leading-relaxed text-ink-soft">
          CoSign writes down who made what, then <span className="text-ink">locks it</span>. Anyone can suggest a new split — it
          only takes effect once every person on the work agrees. That's the whole idea.
        </p>

        {/* Setup checklist */}
        <div className="mt-6 border border-line bg-bg-soft">
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
            <span className="text-[12.5px] font-bold">Get set up</span>
            <span className="font-mono text-[11px] text-ink-faint">1 / 3 done</span>
          </div>

          <div className="flex items-center gap-3 border-b border-line-soft px-4 py-3.5">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ok/15 text-ok"><IconCheck size={12} /></span>
            <span className="flex-1 text-[13px] text-ink-faint line-through">Have a look around the demo catalog</span>
          </div>

          <div className="flex items-center gap-3 border-b border-line-soft bg-[#0d0b0c] px-4 py-3.5">
            <span className="h-5 w-5 shrink-0 rounded-full border border-dashed border-brand" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink">Log one work of your own</div>
              <div className="mt-0.5 text-[11.5px] text-ink-faint">Takes about a minute — title, type, who was there</div>
            </div>
            <button onClick={() => { close(); navigate('/app/new') }} className="shrink-0 rounded-sm bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-soft">Start</button>
          </div>

          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="h-5 w-5 shrink-0 rounded-full border border-line" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink-soft">Add your PRO and IPI</div>
              <div className="mt-0.5 text-[11.5px] text-ink-faint">So every credit pack you share is clearance-ready</div>
            </div>
            <span className="shrink-0 text-xs font-semibold text-ink-faint">Later</span>
          </div>
        </div>

        <div className="mt-3.5 flex items-center gap-2.5 border border-line bg-bg-soft px-4 py-3">
          <IconInfo size={15} className="shrink-0 text-ink-faint" />
          <span className="text-xs leading-relaxed text-ink-soft">
            This is a demo with no login. Use the name in the corner to switch person and see an approval from the other side.
          </span>
        </div>
      </div>
    </div>
  )
}
