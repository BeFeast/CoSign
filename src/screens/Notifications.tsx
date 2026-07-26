import { useNavigate } from 'react-router-dom'
import { useDb } from '@/data/useDb'
import * as repo from '@/data/repo'
import { Button, Card, EmptyState } from '@/components/ui'
import { IconBell, IconCheck, IconEdit, IconPlus, IconUsers } from '@/components/icons'
import { relTime } from '@/lib/format'
import type { NotificationType } from '@/data/schema'

const iconFor: Record<NotificationType, (p: { size?: number }) => JSX.Element> = {
  invite: IconUsers,
  added_to_work: IconPlus,
  approval_requested: IconEdit,
  proposal_resolved: IconCheck,
  offline_confirmed: IconEdit,
}

export default function Notifications() {
  useDb() // subscribe to store changes
  const navigate = useNavigate()
  const me = repo.currentUser()
  const notifs = repo.notificationsFor(me.id)
  const unread = notifs.filter((n) => !n.read_at).length

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Activity</h1>
          <p className="mt-0.5 text-sm text-ink-soft">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={() => repo.markAllNotificationsRead(me.id)}>
            <IconCheck size={15} /> Mark all read
          </Button>
        )}
      </div>

      {notifs.length === 0 ? (
        <EmptyState icon={<IconBell size={36} />} title="No activity yet" body="Approvals, invites and roster changes show up here." />
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <Card
              key={n.id}
              onClick={() => {
                repo.markNotificationRead(n.id)
                if (n.work_id) navigate(`/app/work/${n.work_id}`)
              }}
              className={`flex cursor-pointer items-start gap-3 p-4 transition hover:bg-bg-hover ${!n.read_at ? 'border-brand/30' : ''}`}
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center bg-bg-hover text-ink-soft">
                {(() => { const Icon = iconFor[n.type]; return <Icon size={16} /> })()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{n.title}</span>
                  {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-sm bg-brand" />}
                </div>
                {n.body && <p className="mt-0.5 text-sm text-ink-soft">{n.body}</p>}
                <p className="mt-1 text-xs text-ink-faint">{relTime(n.created_at)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
