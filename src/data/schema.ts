import { z } from 'zod'

// ── Enums ────────────────────────────────────────────────────────────────────
export const workTypes = ['sample', 'beat', 'song'] as const
export const WorkType = z.enum(workTypes)
export type WorkType = z.infer<typeof WorkType>

export const roles = [
  'Sample Creator',
  'Producer',
  'Co-Producer',
  'Writer',
  'Topline',
  'Mixer',
  'Other',
] as const
export const Role = z.enum(roles)
export type Role = z.infer<typeof Role>

export const agreementStatuses = ['confirmed', 'pending'] as const
export const AgreementStatus = z.enum(agreementStatuses)
export type AgreementStatus = z.infer<typeof AgreementStatus>

// confirm_status of a single contribution
export const confirmStatuses = ['confirmed', 'pending', 'awaiting_account'] as const
export const ConfirmStatus = z.enum(confirmStatuses)
export type ConfirmStatus = z.infer<typeof ConfirmStatus>

// ── Entities (PRD §9) ────────────────────────────────────────────────────────
export const User = z.object({
  id: z.string(),
  email: z.string(),
  display_name: z.string(),
  legal_name: z.string().optional().default(''),
  pro_name: z.string().optional().default(''),
  pro_ipi: z.string().optional().default(''),
  publisher_name: z.string().optional().default(''),
  publisher_ipi: z.string().optional().default(''),
  contact_email: z.string().optional().default(''),
  contact_social: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  avatar_hue: z.number().optional().default(260),
  created_at: z.string(),
})
export type User = z.infer<typeof User>

// A local collaborator card owned by a user (person not on CoSign)
export const Contact = z.object({
  id: z.string(),
  owner_user_id: z.string(),
  display_name: z.string(),
  legal_name: z.string().optional().default(''),
  pro_name: z.string().optional().default(''),
  pro_ipi: z.string().optional().default(''),
  publisher_name: z.string().optional().default(''),
  publisher_ipi: z.string().optional().default(''),
  contact_email: z.string().optional().default(''),
  contact_social: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  avatar_hue: z.number().optional().default(160),
  linked_user_id: z.string().nullable().optional().default(null),
  created_at: z.string(),
})
export type Contact = z.infer<typeof Contact>

export const Work = z.object({
  id: z.string(),
  type: WorkType,
  primary_title: z.string(),
  notes: z.string().optional().default(''),
  cover_url: z.string().optional().default(''),
  created_by: z.string(), // user id
  agreement_status: AgreementStatus.default('confirmed'),
  created_at: z.string(),
  updated_at: z.string(),
})
export type Work = z.infer<typeof Work>

export const WorkAka = z.object({
  id: z.string(),
  work_id: z.string(),
  title: z.string(),
  added_by: z.string(),
  created_at: z.string(),
})
export type WorkAka = z.infer<typeof WorkAka>

export const WorkLink = z.object({
  id: z.string(),
  work_id: z.string(),
  label: z.string(),
  url: z.string(),
})
export type WorkLink = z.infer<typeof WorkLink>

export const Contribution = z.object({
  id: z.string(),
  work_id: z.string(),
  user_id: z.string().nullable().optional().default(null),
  contact_id: z.string().nullable().optional().default(null),
  role: Role,
  split_percent: z.number(),
  confirm_status: ConfirmStatus.default('confirmed'),
  offline_confirmed_at: z.string().nullable().optional().default(null),
  offline_note: z.string().optional().default(''),
})
export type Contribution = z.infer<typeof Contribution>

export const WorkLineage = z.object({
  id: z.string(),
  parent_work_id: z.string(), // the source (e.g. the sample)
  child_work_id: z.string(), // the derived work (e.g. the beat) — child USES parent
  relation: z.literal('uses'),
  created_at: z.string(),
})
export type WorkLineage = z.infer<typeof WorkLineage>

// Snapshot roster line inside a proposal payload
export const ProposalMember = z.object({
  contribution_id: z.string().nullable(), // null = newly added member
  user_id: z.string().nullable(),
  contact_id: z.string().nullable(),
  role: Role,
  split_percent: z.number(),
})
export type ProposalMember = z.infer<typeof ProposalMember>

export const proposalStatuses = ['pending', 'approved', 'rejected', 'cancelled'] as const
export const ProposalStatus = z.enum(proposalStatuses)
export type ProposalStatus = z.infer<typeof ProposalStatus>

export const SplitProposal = z.object({
  id: z.string(),
  work_id: z.string(),
  proposed_by: z.string(), // user id
  status: ProposalStatus.default('pending'),
  summary: z.string().optional().default(''),
  payload: z.array(ProposalMember),
  created_at: z.string(),
  resolved_at: z.string().nullable().optional().default(null),
})
export type SplitProposal = z.infer<typeof SplitProposal>

export const SplitProposalVote = z.object({
  id: z.string(),
  proposal_id: z.string(),
  voter_user_id: z.string(),
  vote: z.enum(['approve', 'reject']),
  created_at: z.string(),
})
export type SplitProposalVote = z.infer<typeof SplitProposalVote>

export const workEventTypes = [
  'created',
  'title_changed',
  'aka_added',
  'link_added',
  'note_changed',
  'roster_member_joined',
  'proposal_opened',
  'proposal_approved',
  'proposal_rejected',
  'proposal_applied',
  'proposal_cancelled',
  'offline_confirmed',
  'lineage_added',
  'share_link_created',
] as const
export const WorkEventType = z.enum(workEventTypes)
export type WorkEventType = z.infer<typeof WorkEventType>

export const WorkEvent = z.object({
  id: z.string(),
  work_id: z.string(),
  actor_user_id: z.string().nullable(),
  type: WorkEventType,
  message: z.string(),
  created_at: z.string(),
})
export type WorkEvent = z.infer<typeof WorkEvent>

export const ShareLink = z.object({
  id: z.string(),
  work_id: z.string(),
  token: z.string(),
  created_by: z.string(),
  expires_at: z.string().nullable().optional().default(null),
  revoked_at: z.string().nullable().optional().default(null),
  created_at: z.string(),
})
export type ShareLink = z.infer<typeof ShareLink>

export const notificationTypes = [
  'invite',
  'added_to_work',
  'approval_requested',
  'proposal_resolved',
  'offline_confirmed',
] as const
export const NotificationType = z.enum(notificationTypes)
export type NotificationType = z.infer<typeof NotificationType>

export const Notification = z.object({
  id: z.string(),
  user_id: z.string(),
  type: NotificationType,
  title: z.string(),
  body: z.string().optional().default(''),
  work_id: z.string().nullable().optional().default(null),
  read_at: z.string().nullable().optional().default(null),
  created_at: z.string(),
})
export type Notification = z.infer<typeof Notification>

export const inviteStatuses = ['sent', 'accepted'] as const
export const Invite = z.object({
  id: z.string(),
  email: z.string(),
  invited_by: z.string(),
  work_id: z.string().nullable().optional().default(null),
  contact_id: z.string().nullable().optional().default(null),
  token: z.string(),
  status: z.enum(inviteStatuses).default('sent'),
  created_at: z.string(),
})
export type Invite = z.infer<typeof Invite>

// ── Full DB shape ────────────────────────────────────────────────────────────
export const Database = z.object({
  version: z.number(),
  current_user_id: z.string(),
  users: z.array(User),
  contacts: z.array(Contact),
  works: z.array(Work),
  akas: z.array(WorkAka),
  links: z.array(WorkLink),
  contributions: z.array(Contribution),
  lineage: z.array(WorkLineage),
  proposals: z.array(SplitProposal),
  votes: z.array(SplitProposalVote),
  events: z.array(WorkEvent),
  shareLinks: z.array(ShareLink),
  notifications: z.array(Notification),
  invites: z.array(Invite),
})
export type Database = z.infer<typeof Database>
