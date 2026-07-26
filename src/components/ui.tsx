import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { initials } from '@/lib/format'

// ── Button ───────────────────────────────────────────────────────────────────
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}
export function Button({ variant = 'secondary', size = 'md', className = '', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed select-none'
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
  }
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-soft',
    secondary: 'bg-bg-hover text-ink hover:bg-line border border-line',
    outline: 'bg-transparent text-ink border border-line hover:bg-bg-hover',
    ghost: 'bg-transparent text-ink-soft hover:text-ink hover:bg-bg-hover',
    danger: 'bg-bad/15 text-bad hover:bg-bad/25 border border-bad/30',
  }
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  )
}

// ── Badge / chip ─────────────────────────────────────────────────────────────
export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'ok' | 'warn' | 'bad'; className?: string }) {
  const tones = {
    neutral: 'bg-bg-hover text-ink-soft border border-line',
    brand: 'bg-brand/15 text-brand-soft border border-brand/30',
    ok: 'bg-ok/15 text-ok border border-ok/25',
    warn: 'bg-warn/15 text-warn border border-warn/25',
    bad: 'bg-bad/15 text-bad border border-bad/25',
  }
  return <span className={`chip ${tones[tone]} ${className}`}>{children}</span>
}

// ── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, hue = 260, size = 36, account = true }: { name: string; hue?: number; size?: number; account?: boolean }) {
  const s = { width: size, height: size, fontSize: size * 0.38 }
  // Monochrome tiles: the stored hue only nudges the shade of a warm neutral,
  // so people stay distinguishable while red remains the app's only real color.
  const light = 30 + Math.round(((hue % 360) / 360) * 15) // 30–45%
  const bg = `hsl(24 7% ${account ? light : light - 7}%)`
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center font-bold text-white/90"
      style={{ ...s, background: bg }}
      title={name}
    >
      {initials(name)}
      {!account && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 border-2 border-bg-card bg-warn" title="Local contact — not on CoSign" />
      )}
    </span>
  )
}

// ── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_.15s_ease]" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} card p-5 sm:p-6 max-h-[92vh] overflow-y-auto rounded-b-none sm:rounded-sm animate-[slideUp_.2s_ease]`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-sm p-1.5 text-ink-faint hover:bg-bg-hover hover:text-ink" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-line px-6 py-16 text-center">
      {icon && <div className="mb-4 text-ink-faint">{icon}</div>}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ── Toast ────────────────────────────────────────────────────────────────────
type Toast = { id: number; message: string; tone: 'ok' | 'bad' | 'neutral' }
const ToastCtx = createContext<(message: string, tone?: Toast['tone']) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)
  const push = useCallback((message: string, tone: Toast['tone'] = 'neutral') => {
    const id = ++counter.current
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-sm border px-4 py-2.5 text-sm font-medium shadow-xl backdrop-blur animate-[slideUp_.2s_ease] ${
              t.tone === 'ok'
                ? 'border-ok/30 bg-ok/15 text-ok'
                : t.tone === 'bad'
                  ? 'border-bad/30 bg-bad/15 text-bad'
                  : 'border-line bg-bg-card text-ink'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string; badge?: number }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition ${
            active === t.key ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
          }`}
        >
          {t.label}
          {t.badge ? <span className="ml-1.5 rounded-sm bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-soft">{t.badge}</span> : null}
          {active === t.key && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-sm bg-brand" />}
        </button>
      ))}
    </div>
  )
}
