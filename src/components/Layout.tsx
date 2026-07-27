import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { Avatar, Modal } from './ui'
import { IconBell, IconLibrary, IconPlus, IconUser, IconUsers, IconSwap } from './icons'
import WelcomeTour from './WelcomeTour'

const Brand = () => (
  <div className="flex items-center gap-2">
    <span className="grid h-8 w-8 place-items-center rounded-sm bg-brand font-extrabold text-white">C</span>
    <span className="text-lg font-extrabold tracking-tight">CoSign</span>
  </div>
)

function IdentitySwitcher() {
  const db = useDb()
  const [open, setOpen] = useState(false)
  const me = db.users.find((u) => u.id === db.current_user_id)!
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-line bg-bg-soft px-2 py-1.5 text-left transition hover:bg-bg-hover"
        title="Demo: switch which collaborator you're viewing as"
      >
        <Avatar name={me.display_name} hue={me.avatar_hue} size={28} />
        <div className="hidden leading-tight sm:block">
          <div className="text-[10px] uppercase tracking-wide text-ink-faint">Viewing as · demo</div>
          <div className="text-xs font-semibold">{me.display_name}</div>
        </div>
        <IconSwap size={15} className="text-ink-faint" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Switch collaborator (demo)">
        <p className="mb-4 text-sm text-ink-soft">
          Approvals are multi-party — normally each person signs from their own account.
          There's no login in this demo, so you can step into any collaborator here to send and
          approve changes on the same catalog.
        </p>
        <div className="space-y-2">
          {db.users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                repo.setCurrentUser(u.id)
                setOpen(false)
              }}
              className={`flex w-full items-center gap-3 rounded-sm border p-3 text-left transition ${
                u.id === me.id ? 'border-brand bg-brand/10' : 'border-line hover:bg-bg-hover'
              }`}
            >
              <Avatar name={u.display_name} hue={u.avatar_hue} size={38} />
              <div className="flex-1">
                <div className="font-semibold">{u.display_name}</div>
                <div className="text-xs text-ink-faint">{u.pro_name}{u.pro_ipi ? ` · IPI ${u.pro_ipi}` : ''}</div>
              </div>
              {u.id === me.id && <span className="text-xs font-semibold text-brand-soft">current</span>}
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}

const navItems = [
  { to: '/app', label: 'Catalog', short: 'Catalog', icon: IconLibrary, end: true },
  { to: '/app/collaborators', label: 'People', short: 'People', icon: IconUsers, end: false },
  { to: '/app/notifications', label: 'Activity', short: 'Activity', icon: IconBell, end: false },
  { to: '/app/profile', label: 'Your rights info', short: 'Rights', icon: IconUser, end: false },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const db = useDb()
  const navigate = useNavigate()
  const loc = useLocation()
  const unread = repo.unreadCount(db.current_user_id)

  return (
    <div className="min-h-full">
      <WelcomeTour />
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          {/* Temporary (showcase): logo → landing/main page, not the app */}
          <button onClick={() => navigate('/')} className="shrink-0">
            <Brand />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app/new')}
              className="inline-flex items-center gap-1.5 bg-brand px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-soft"
            >
              <IconPlus size={17} />
              <span className="hidden sm:inline">Log a work</span>
            </button>
            <IdentitySwitcher />
          </div>
        </div>
        {/* Desktop nav */}
        <nav className="mx-auto hidden max-w-5xl gap-1 px-3 sm:flex">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'text-ink' : 'text-ink-faint hover:text-ink-soft'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <n.icon size={17} />
                  {n.label}
                  {n.to === '/app/notifications' && unread > 0 && (
                    <span className="grid h-4 min-w-4 place-items-center rounded-sm bg-brand px-1 text-[10px] font-bold text-white">{unread}</span>
                  )}
                  {isActive && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-sm bg-brand" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:pb-16">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/90 backdrop-blur-xl sm:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-4">
          {navItems.map((n) => {
            const active = n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to)
            return (
              <button
                key={n.to}
                onClick={() => navigate(n.to)}
                className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${active ? 'text-brand-soft' : 'text-ink-faint'}`}
              >
                <n.icon size={20} />
                {n.short}
                {n.to === '/app/notifications' && unread > 0 && (
                  <span className="absolute right-[22%] top-1.5 h-2 w-2 rounded-sm bg-brand" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
