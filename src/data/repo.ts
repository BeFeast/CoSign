import { loadDb, writeDb } from './db'
import { id, now, token } from '@/lib/ids'
import { evenSplits, sumSplits } from '@/lib/splits'
import type {
  Contact,
  Contribution,
  Database,
  Notification,
  NotificationType,
  ProposalMember,
  Role,
  ShareLink,
  SplitProposal,
  User,
  Work,
  WorkEvent,
  WorkEventType,
  WorkType,
} from './schema'

// ─────────────────────────────────────────────────────────────────────────────
// This module is the single seam between the app and its data store.
// Swapping localStorage for Supabase later means reimplementing these functions
// against Postgres/RLS — the UI never touches the store directly.
// ─────────────────────────────────────────────────────────────────────────────

export type RosterEntry = {
  contribution: Contribution
  person: { kind: 'user'; user: User } | { kind: 'contact'; contact: Contact }
  name: string
  isAccount: boolean
}

// ── Reads ────────────────────────────────────────────────────────────────────
export const db = () => loadDb()

export const currentUser = (): User => {
  const d = loadDb()
  return d.users.find((u) => u.id === d.current_user_id)!
}

export const getUser = (uid: string | null | undefined) =>
  uid ? loadDb().users.find((u) => u.id === uid) ?? null : null

export const getContact = (cid: string | null | undefined) =>
  cid ? loadDb().contacts.find((c) => c.id === cid) ?? null : null

export const getWork = (wid: string) => loadDb().works.find((w) => w.id === wid) ?? null

export const contributionsFor = (wid: string) =>
  loadDb().contributions.filter((c) => c.work_id === wid)

export function personName(c: Contribution): string {
  if (c.user_id) return getUser(c.user_id)?.display_name ?? 'Unknown'
  if (c.contact_id) return getContact(c.contact_id)?.display_name ?? 'Unknown'
  return 'Unknown'
}

export function rosterFor(wid: string): RosterEntry[] {
  return contributionsFor(wid).map((contribution) => {
    if (contribution.user_id) {
      const user = getUser(contribution.user_id)!
      return { contribution, person: { kind: 'user', user }, name: user.display_name, isAccount: true }
    }
    const contact = getContact(contribution.contact_id)!
    return { contribution, person: { kind: 'contact', contact }, name: contact.display_name, isAccount: false }
  })
}

// Works the given user can see: any work they contribute to.
export function worksForUser(uid: string): Work[] {
  const d = loadDb()
  const ownedContribWorkIds = new Set(
    d.contributions.filter((c) => c.user_id === uid).map((c) => c.work_id),
  )
  // also include works whose roster has a contact owned by this user (their private ledger)
  const contactIds = new Set(d.contacts.filter((c) => c.owner_user_id === uid).map((c) => c.id))
  for (const c of d.contributions) {
    if (c.contact_id && contactIds.has(c.contact_id)) ownedContribWorkIds.add(c.work_id)
  }
  // include works they created
  for (const w of d.works) if (w.created_by === uid) ownedContribWorkIds.add(w.id)
  return d.works
    .filter((w) => ownedContribWorkIds.has(w.id))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
}

export function userCanAccessWork(uid: string, wid: string): boolean {
  return worksForUser(uid).some((w) => w.id === wid)
}

export const akasFor = (wid: string) => loadDb().akas.filter((a) => a.work_id === wid)
export const linksFor = (wid: string) => loadDb().links.filter((l) => l.work_id === wid)
export const eventsFor = (wid: string) =>
  loadDb().events.filter((e) => e.work_id === wid).sort((a, b) => b.created_at.localeCompare(a.created_at))

// Lineage: works this one USES (parents), and works that USE this one (children)
export function usesWorks(wid: string): Work[] {
  const d = loadDb()
  return d.lineage
    .filter((l) => l.child_work_id === wid)
    .map((l) => d.works.find((w) => w.id === l.parent_work_id))
    .filter((w): w is Work => !!w)
}
export function usedByWorks(wid: string): Work[] {
  const d = loadDb()
  return d.lineage
    .filter((l) => l.parent_work_id === wid)
    .map((l) => d.works.find((w) => w.id === l.child_work_id))
    .filter((w): w is Work => !!w)
}

export const openProposalFor = (wid: string) =>
  loadDb().proposals.find((p) => p.work_id === wid && p.status === 'pending') ?? null

export const votesFor = (proposalId: string) =>
  loadDb().votes.filter((v) => v.proposal_id === proposalId)

// Account users who must approve a proposal = current roster account holders
// + account holders named in the payload. Contacts never vote.
export function affectedUsersFor(wid: string, proposal: SplitProposal): string[] {
  const affected = new Set<string>()
  for (const c of contributionsFor(wid)) if (c.user_id) affected.add(c.user_id)
  for (const m of proposal.payload) if (m.user_id) affected.add(m.user_id)
  return [...affected]
}

export type PendingForUser = {
  work: Work
  proposal: SplitProposal
  proposer: User | null
  myShare: ProposalMember | null
}

// Works with an open proposal that is stuck on THIS user's approval (the
// "needs you" lane). Single source of truth shared by Library + WorkDetail.
export function worksNeedingApprovalFrom(uid: string): PendingForUser[] {
  const out: PendingForUser[] = []
  for (const work of worksForUser(uid)) {
    const proposal = openProposalFor(work.id)
    if (!proposal) continue
    if (votesFor(proposal.id).some((v) => v.voter_user_id === uid)) continue // already voted
    if (!affectedUsersFor(work.id, proposal).includes(uid)) continue // not my call
    out.push({
      work,
      proposal,
      proposer: getUser(proposal.proposed_by),
      myShare: proposal.payload.find((m) => m.user_id === uid) ?? null,
    })
  }
  return out
}

export const notificationsFor = (uid: string) =>
  loadDb().notifications.filter((n) => n.user_id === uid).sort((a, b) => b.created_at.localeCompare(a.created_at))

export const unreadCount = (uid: string) =>
  loadDb().notifications.filter((n) => n.user_id === uid && !n.read_at).length

export const shareLinksFor = (wid: string) =>
  loadDb().shareLinks.filter((s) => s.work_id === wid && !s.revoked_at)

export const shareLinkByToken = (t: string) =>
  loadDb().shareLinks.find((s) => s.token === t && !s.revoked_at) ?? null

export const contactsOwnedBy = (uid: string) =>
  loadDb().contacts.filter((c) => c.owner_user_id === uid)

// Directory = other CoSign users + local contacts owned by current user
export function directoryFor(uid: string) {
  const d = loadDb()
  const users = d.users.filter((u) => u.id !== uid)
  const contacts = contactsOwnedBy(uid)
  return { users, contacts }
}

// ── Internal helpers ─────────────────────────────────────────────────────────
function logEvent(
  draft: Database,
  wid: string,
  actor: string | null,
  type: WorkEventType,
  message: string,
) {
  draft.events.push({ id: id(), work_id: wid, actor_user_id: actor, type, message, created_at: now() })
}

function notify(
  draft: Database,
  uid: string,
  type: NotificationType,
  title: string,
  body: string,
  wid: string | null,
) {
  const n: Notification = {
    id: id(),
    user_id: uid,
    type,
    title,
    body,
    work_id: wid,
    read_at: null,
    created_at: now(),
  }
  draft.notifications.push(n)
}

function touchWork(draft: Database, wid: string) {
  const w = draft.works.find((x) => x.id === wid)
  if (w) w.updated_at = now()
}

// ── Session ──────────────────────────────────────────────────────────────────
export function setCurrentUser(uid: string) {
  writeDb((d) => ({ ...d, current_user_id: uid }))
}

// ── Profile ──────────────────────────────────────────────────────────────────
export function updateUser(uid: string, patch: Partial<User>) {
  writeDb((d) => {
    const u = d.users.find((x) => x.id === uid)
    if (u) Object.assign(u, patch)
    return d
  })
}

// ── Contacts / directory ─────────────────────────────────────────────────────
export function createContact(input: Partial<Contact> & { display_name: string }): Contact {
  const c: Contact = {
    id: id(),
    owner_user_id: currentUser().id,
    display_name: input.display_name,
    legal_name: input.legal_name ?? '',
    pro_name: input.pro_name ?? '',
    pro_ipi: input.pro_ipi ?? '',
    publisher_name: input.publisher_name ?? '',
    publisher_ipi: input.publisher_ipi ?? '',
    contact_email: input.contact_email ?? '',
    contact_social: input.contact_social ?? '',
    notes: input.notes ?? '',
    avatar_hue: Math.floor(Math.random() * 360),
    linked_user_id: null,
    created_at: now(),
  }
  writeDb((d) => ({ ...d, contacts: [...d.contacts, c] }))
  return c
}

export function updateContact(cid: string, patch: Partial<Contact>) {
  writeDb((d) => {
    const c = d.contacts.find((x) => x.id === cid)
    if (c) Object.assign(c, patch)
    return d
  })
}

export function inviteByEmail(email: string, contactId: string | null, wid: string | null) {
  writeDb((d) => {
    d.invites.push({
      id: id(),
      email,
      invited_by: currentUser().id,
      work_id: wid,
      contact_id: contactId,
      token: token(),
      status: 'sent',
      created_at: now(),
    })
    return d
  })
}

// ── Works ────────────────────────────────────────────────────────────────────
export function createWork(input: {
  type: WorkType
  primary_title: string
  notes?: string
  cover_url?: string
  members: Array<{ user_id: string | null; contact_id: string | null; role: Role }>
}): Work {
  const me = currentUser()
  const wid = id()
  const splits = evenSplits(input.members.length)
  const work: Work = {
    id: wid,
    type: input.type,
    primary_title: input.primary_title,
    notes: input.notes ?? '',
    cover_url: input.cover_url ?? '',
    created_by: me.id,
    agreement_status: 'confirmed',
    created_at: now(),
    updated_at: now(),
  }
  writeDb((d) => {
    d.works.push(work)
    input.members.forEach((m, i) => {
      const isAccount = !!m.user_id
      d.contributions.push({
        id: id(),
        work_id: wid,
        user_id: m.user_id,
        contact_id: m.contact_id,
        role: m.role,
        split_percent: splits[i],
        confirm_status: isAccount ? 'confirmed' : 'awaiting_account',
        offline_confirmed_at: null,
        offline_note: '',
      })
      if (m.user_id && m.user_id !== me.id) {
        notify(d, m.user_id, 'added_to_work', `You were added to “${work.primary_title}”`, `${me.display_name} added you to the roster.`, wid)
      }
    })
    logEvent(d, wid, me.id, 'created', `${me.display_name} created the ${input.type} “${input.primary_title}”.`)
    return d
  })
  return work
}

export function updateWorkNotes(wid: string, notes: string) {
  const me = currentUser()
  writeDb((d) => {
    const w = d.works.find((x) => x.id === wid)
    if (w && w.notes !== notes) {
      w.notes = notes
      logEvent(d, wid, me.id, 'note_changed', `${me.display_name} updated the notes.`)
      touchWork(d, wid)
    }
    return d
  })
}

// Rename: previous primary title auto-saved as AKA (PRD §5.8)
export function renameWork(wid: string, newTitle: string) {
  const me = currentUser()
  writeDb((d) => {
    const w = d.works.find((x) => x.id === wid)
    if (!w || w.primary_title.trim() === newTitle.trim() || !newTitle.trim()) return d
    const old = w.primary_title
    // save old as AKA if not already present (case-insensitive)
    const exists = d.akas.some((a) => a.work_id === wid && a.title.toLowerCase() === old.toLowerCase())
    if (!exists) {
      d.akas.push({ id: id(), work_id: wid, title: old, added_by: me.id, created_at: now() })
    }
    w.primary_title = newTitle.trim()
    logEvent(d, wid, me.id, 'title_changed', `${me.display_name} renamed to “${newTitle.trim()}” (was “${old}”, kept as AKA).`)
    touchWork(d, wid)
    return d
  })
}

export function addAka(wid: string, title: string) {
  const me = currentUser()
  const clean = title.trim()
  if (!clean) return
  writeDb((d) => {
    const w = d.works.find((x) => x.id === wid)
    if (!w) return d
    const dup =
      w.primary_title.toLowerCase() === clean.toLowerCase() ||
      d.akas.some((a) => a.work_id === wid && a.title.toLowerCase() === clean.toLowerCase())
    if (dup) return d
    d.akas.push({ id: id(), work_id: wid, title: clean, added_by: me.id, created_at: now() })
    logEvent(d, wid, me.id, 'aka_added', `${me.display_name} added AKA “${clean}”.`)
    touchWork(d, wid)
    return d
  })
}

export function removeAka(akaId: string) {
  writeDb((d) => ({ ...d, akas: d.akas.filter((a) => a.id !== akaId) }))
}

export function addLink(wid: string, label: string, url: string) {
  const me = currentUser()
  if (!label.trim() || !url.trim()) return
  writeDb((d) => {
    d.links.push({ id: id(), work_id: wid, label: label.trim(), url: url.trim() })
    logEvent(d, wid, me.id, 'link_added', `${me.display_name} added link “${label.trim()}”.`)
    touchWork(d, wid)
    return d
  })
}

export function removeLink(linkId: string) {
  writeDb((d) => ({ ...d, links: d.links.filter((l) => l.id !== linkId) }))
}

// ── Lineage ──────────────────────────────────────────────────────────────────
export function addLineageUses(childWorkId: string, parentWorkId: string) {
  const me = currentUser()
  if (childWorkId === parentWorkId) return
  writeDb((d) => {
    const dup = d.lineage.some(
      (l) => l.child_work_id === childWorkId && l.parent_work_id === parentWorkId,
    )
    if (dup) return d
    d.lineage.push({ id: id(), parent_work_id: parentWorkId, child_work_id: childWorkId, relation: 'uses', created_at: now() })
    const parent = d.works.find((w) => w.id === parentWorkId)
    logEvent(d, childWorkId, me.id, 'lineage_added', `${me.display_name} linked lineage: uses “${parent?.primary_title ?? 'a work'}”.`)
    touchWork(d, childWorkId)
    return d
  })
}

export function removeLineage(childWorkId: string, parentWorkId: string) {
  writeDb((d) => ({
    ...d,
    lineage: d.lineage.filter(
      (l) => !(l.child_work_id === childWorkId && l.parent_work_id === parentWorkId),
    ),
  }))
}

// ── Offline confirm (local contacts) ─────────────────────────────────────────
export function confirmOffline(contributionId: string, note: string) {
  const me = currentUser()
  writeDb((d) => {
    const c = d.contributions.find((x) => x.id === contributionId)
    if (!c) return d
    c.confirm_status = 'confirmed'
    c.offline_confirmed_at = now()
    c.offline_note = note
    logEvent(d, c.work_id, me.id, 'offline_confirmed', `${me.display_name} confirmed ${personNameIn(d, c)} offline${note ? ` — “${note}”` : ''}.`)
    touchWork(d, c.work_id)
    return d
  })
}

function personNameIn(d: Database, c: Contribution): string {
  if (c.user_id) return d.users.find((u) => u.id === c.user_id)?.display_name ?? 'a collaborator'
  if (c.contact_id) return d.contacts.find((x) => x.id === c.contact_id)?.display_name ?? 'a collaborator'
  return 'a collaborator'
}

// ── Proposals / approval workflow (PRD §5.7) ─────────────────────────────────
export function openProposal(wid: string, payload: ProposalMember[], summary: string) {
  const me = currentUser()
  if (Math.abs(sumSplits(payload.map((p) => p.split_percent)) - 100) > 0.001) {
    throw new Error('Splits must total 100%.')
  }
  writeDb((d) => {
    // cancel any existing pending proposal
    for (const p of d.proposals) {
      if (p.work_id === wid && p.status === 'pending') {
        p.status = 'cancelled'
        p.resolved_at = now()
      }
    }
    const proposalId = id()
    d.proposals.push({
      id: proposalId,
      work_id: wid,
      proposed_by: me.id,
      status: 'pending',
      summary,
      payload,
      created_at: now(),
      resolved_at: null,
    })
    // proposer auto-approves
    d.votes.push({ id: id(), proposal_id: proposalId, voter_user_id: me.id, vote: 'approve', created_at: now() })
    const w = d.works.find((x) => x.id === wid)
    if (w) w.agreement_status = 'pending'
    logEvent(d, wid, me.id, 'proposal_opened', `${me.display_name} proposed a split change${summary ? `: ${summary}` : ''}.`)
    // notify every affected account holder except proposer
    for (const uid of affectedAccountUserIds(d, wid, payload)) {
      if (uid !== me.id) {
        notify(d, uid, 'approval_requested', `${me.display_name} needs your approval`, `“${w?.primary_title}” — ${summary || 'a split/roster change'}.`, wid)
      }
    }
    touchWork(d, wid)
    return d
  })
}

// account holders currently on roster + any newly-added account members in payload
function affectedAccountUserIds(d: Database, wid: string, payload: ProposalMember[]): string[] {
  const set = new Set<string>()
  for (const c of d.contributions) if (c.work_id === wid && c.user_id) set.add(c.user_id)
  for (const m of payload) if (m.user_id) set.add(m.user_id)
  return [...set]
}

export function voteOnProposal(proposalId: string, vote: 'approve' | 'reject') {
  const me = currentUser()
  writeDb((d) => {
    const p = d.proposals.find((x) => x.id === proposalId)
    if (!p || p.status !== 'pending') return d
    // record/replace this user's vote
    d.votes = d.votes.filter((v) => !(v.proposal_id === proposalId && v.voter_user_id === me.id))
    d.votes.push({ id: id(), proposal_id: proposalId, voter_user_id: me.id, vote, created_at: now() })
    const w = d.works.find((x) => x.id === p.work_id)!

    if (vote === 'reject') {
      p.status = 'rejected'
      p.resolved_at = now()
      w.agreement_status = 'confirmed'
      logEvent(d, p.work_id, me.id, 'proposal_rejected', `${me.display_name} rejected the proposal. Previous splits kept.`)
      notify(d, p.proposed_by, 'proposal_resolved', `Proposal rejected`, `${me.display_name} rejected your change to “${w.primary_title}”.`, p.work_id)
      return d
    }

    logEvent(d, p.work_id, me.id, 'proposal_approved', `${me.display_name} approved the change.`)

    // check if all affected account holders have approved
    const required = affectedAccountUserIds(d, p.work_id, p.payload)
    const approvals = new Set(
      d.votes.filter((v) => v.proposal_id === proposalId && v.vote === 'approve').map((v) => v.voter_user_id),
    )
    const allApproved = required.every((uid) => approvals.has(uid))

    if (allApproved) {
      applyProposal(d, proposalId)
    }
    touchWork(d, p.work_id)
    return d
  })
}

// mutates draft: replace roster with proposal payload
function applyProposal(d: Database, proposalId: string) {
  const p = d.proposals.find((x) => x.id === proposalId)!
  const wid = p.work_id
  const existing = d.contributions.filter((c) => c.work_id === wid)
  const keepIds = new Set(p.payload.map((m) => m.contribution_id).filter(Boolean) as string[])

  // remove contributions not in payload
  d.contributions = d.contributions.filter((c) => c.work_id !== wid || keepIds.has(c.id))

  // update existing + add new
  for (const m of p.payload) {
    if (m.contribution_id) {
      const c = d.contributions.find((x) => x.id === m.contribution_id)
      if (c) {
        c.role = m.role
        c.split_percent = m.split_percent
      }
    } else {
      const isAccount = !!m.user_id
      d.contributions.push({
        id: id(),
        work_id: wid,
        user_id: m.user_id,
        contact_id: m.contact_id,
        role: m.role,
        split_percent: m.split_percent,
        confirm_status: isAccount ? 'confirmed' : 'awaiting_account',
        offline_confirmed_at: null,
        offline_note: '',
      })
      if (m.user_id) {
        const w = d.works.find((x) => x.id === wid)
        notify(d, m.user_id, 'added_to_work', `You're now on “${w?.primary_title}”`, `An approved proposal added you to the roster.`, wid)
      }
    }
  }
  void existing
  p.status = 'approved'
  p.resolved_at = now()
  const w = d.works.find((x) => x.id === wid)!
  w.agreement_status = 'confirmed'
  logEvent(d, wid, p.proposed_by, 'proposal_applied', `Everyone approved the change. Splits are now locked in.`)
  notify(d, p.proposed_by, 'proposal_resolved', `Change approved`, `Everyone agreed to your change to “${w.primary_title}”.`, wid)
}

export function cancelProposal(proposalId: string) {
  const me = currentUser()
  writeDb((d) => {
    const p = d.proposals.find((x) => x.id === proposalId)
    if (!p || p.status !== 'pending') return d
    p.status = 'cancelled'
    p.resolved_at = now()
    const w = d.works.find((x) => x.id === p.work_id)
    if (w) w.agreement_status = 'confirmed'
    logEvent(d, p.work_id, me.id, 'proposal_cancelled', `${me.display_name} cancelled the proposal.`)
    return d
  })
}

// ── Notifications ────────────────────────────────────────────────────────────
export function markNotificationRead(nid: string) {
  writeDb((d) => {
    const n = d.notifications.find((x) => x.id === nid)
    if (n && !n.read_at) n.read_at = now()
    return d
  })
}

export function markAllNotificationsRead(uid: string) {
  writeDb((d) => {
    for (const n of d.notifications) if (n.user_id === uid && !n.read_at) n.read_at = now()
    return d
  })
}

// ── Share links ──────────────────────────────────────────────────────────────
export function createShareLink(wid: string): ShareLink {
  const me = currentUser()
  const link: ShareLink = {
    id: id(),
    work_id: wid,
    token: token(),
    created_by: me.id,
    expires_at: null,
    revoked_at: null,
    created_at: now(),
  }
  writeDb((d) => {
    d.shareLinks.push(link)
    logEvent(d, wid, me.id, 'share_link_created', `${me.display_name} created a credit pack share link.`)
    return d
  })
  return link
}

export function revokeShareLink(linkId: string) {
  writeDb((d) => {
    const s = d.shareLinks.find((x) => x.id === linkId)
    if (s) s.revoked_at = now()
    return d
  })
}

export type { WorkEvent }
