# CoSign — Product Requirements Document (MVP)

| Field | Value |
|-------|--------|
| **Product** | CoSign |
| **Version** | MVP v0.1 |
| **Status** | Draft for build |
| **Date** | 2026-07-25 |
| **Related** | [`Ideation.md`](../product/Ideation.md) — problem, thesis, decisions |

---

## 1. Summary

CoSign is a collab ledger for hybrid music creators (samples, beats, songs). It records **who made what layer**, keeps **PRO/credit info** ready to share, tracks **all names** a work has had, and requires **mutual approval** before ownership splits change.

It sits **before and after** marketplaces (BeatStars, packs, releases) — not a replacement for them.

**One-liner:**  
*If you were on it, co-sign it — credits, splits, and PRO info in one place.*

---

## 2. Goals & non-goals

### Goals (MVP)
1. Never lose track of who contributed to a sample/beat/song.
2. Default fair (even) splits with no silent ownership edits.
3. Search a work by any historical name.
4. Send a clean credit + PRO pack to a label/buyer without DM hunting.
5. Support rotating collabs via a reusable collaborator directory.

### Non-goals (MVP)
- Replacing BeatStars / DistroKid / PRO registration portals
- Full legal e-sign / lawyer-grade contracts
- Sync licensing marketplace
- Manager multi-client agency suite
- Complex publishing math (writer vs master, territories, etc.)
- Native iOS/Android stores (web-first; mobile-friendly responsive + PWA later)
- Audio fingerprinting / AI sample detection

---

## 3. Target user (MVP)

**Primary:** Hybrid underground creators who make samples and/or beats, collab in small trusted circles, sell via BeatStars/packs/DMs, and occasionally need clearance or label handoff.

**Not primary for MVP:** Managers, labels, music lawyers (may use shared credit-pack links only as recipients).

---

## 4. Core concepts

| Concept | Definition |
|---------|------------|
| **Profile** | A person: platform user or local contact. Holds PRO/credit fields. |
| **Work** | An asset record: `sample` \| `beat` \| `song` (MVP types). |
| **Contribution** | Profile + role + split % on a Work. |
| **Lineage** | Work A *uses* / *derived from* Work B. |
| **AKA** | Alternate or former title; all searchable. |
| **Agreement** | Split/roster state that requires multi-party approval. |
| **Credit pack** | Shareable/exportable snapshot: titles, roster, roles, %, PRO info, confirmation status. |

**Principle:** Catalog (names, notes, links) is editable by anyone on the work. Ownership (splits, roster membership) only changes via proposal + approval.

---

## 5. MVP features

### 5.1 Auth
- Email magic link and/or Google OAuth
- Signup → user profile (display name required; PRO fields optional at signup)
- Session-based authenticated app shell

### 5.2 User profile (rights wallet)
Editable fields:
- Display name, legal name (optional)
- PRO name, IPI/CAE
- Publisher name / IPI (optional)
- Email, phone/IG/other contact (optional)
- Notes (private to self unless exposed via credit pack rules — MVP: credit pack shows PRO + display/legal name + contact email if set)

### 5.3 Collaborator directory
- List people you’ve added or collab’d with
- **Add local contact** (not on CoSign): name + optional PRO/contact fields
- **Invite / link user** by email (creates invite; on join, can merge into existing local contact later if emails match — MVP: simple invite + manual link is enough; auto-merge can be v1.1)
- Search directory by name

### 5.4 Works library
- Create work: type (`sample` / `beat` / `song`), primary title
- Optional: notes, external links (BeatStars, Drive, YouTube, etc.), cover image URL/upload
- List + search works (by primary title **and** AKAs)
- Work detail page: roster, splits, AKAs, lineage, status, activity

### 5.5 Roster & roles
- Add collaborators from directory onto a work
- Role presets (MVP):  
  `Sample Creator` · `Producer` · `Co-Producer` · `Writer` · `Topline` · `Mixer` · `Other`
- Remove from roster = ownership change → goes through approval flow
- At least one contributor required

### 5.6 Splits
- **Default:** even split across all contributors on the work (auto-rebalance on approved roster add/remove)
- Manual % override allowed only via **proposal** (must sum to 100%)
- Display pending vs confirmed state clearly

### 5.7 Approval workflow (critical)
Triggers requiring approval from **all current contributors** (and proposed new members if adding):
- Change any split %
- Add contributor to ownership roster
- Remove contributor from ownership roster

Behavior:
- Proposer submits change → work agreement status = `pending`
- Each affected party can **Approve** or **Reject**
- On full approval → apply change, status = `confirmed`, write audit log
- On any reject → discard proposal, keep previous confirmed state, notify proposer
- Users who are **local contacts only** (no account): MVP records them on the roster but **cannot digitally approve**; UI marks them `awaiting account / manual confirm`. Record owner can mark “confirmed offline” with a note (timestamped) — honest about limitation, avoids fake security.
- Linked users: in-app + email notification with deep link

### 5.8 Titles & AKAs
- Anyone on the work can edit primary title
- On primary title change → previous title automatically saved as AKA
- Anyone on the work can add AKAs manually
- Search resolves AKAs

### 5.9 Lineage
- On a work, link **Uses** → another work you can access (e.g. beat uses sample)
- Show reverse: **Used by** on the parent work
- Credit pack includes lineage summary

### 5.10 Credit / PRO pack
From work detail:
- **Copy summary** (plain text)
- **Share link** (read-only page, optionally unlisted token URL — no login required for recipient)
- Contents: primary title + AKAs, type, lineage, roster (role, %, confirmation state), each person’s PRO/IPI/publisher/contact as available, last confirmed timestamp

### 5.11 Audit log (MVP-light)
Per work, append-only events:
- Created
- Title/AKA changes
- Proposal opened / approved / rejected / applied
- Offline confirm noted
- Credit pack link created

### 5.12 Notifications (MVP)
- Email on: invite, added to work, approval requested, proposal resolved
- In-app notification list (simple)

---

## 6. Permission matrix

| Action | Anyone on work | Proposer + all must approve | Profile owner only |
|--------|----------------|-----------------------------|--------------------|
| Edit title, AKAs, notes, links, cover | ✓ | | |
| Propose split/roster change | ✓ | | |
| Apply split/roster change | | ✓ | |
| Edit own PRO/profile fields | | | ✓ |
| Edit local contact fields | Creator of that contact | | |
| Create work | Any signed-in user | | |
| View work | Contributors (+ share-link viewers for credit pack only) | | |

**Visibility MVP:** Works are private to contributors (not a public social graph).

---

## 7. User stories (MVP acceptance)

1. **As a producer**, I can create a sample, add two collabs from my directory, and see 33.33% each pending/confirmed.
2. **As a producer**, I can create a beat that **uses** that sample without putting the beatmaker on the sample roster.
3. **As a collab**, I get notified when someone proposes changing my % and must approve before it sticks.
4. **As a producer**, I can add “Midnight Type Beat” as AKA and later rename to the release title without losing searchability.
5. **As a producer**, when a label asks for PRO info, I open the work and share a credit pack link in one action.
6. **As a producer**, I can add a collab who isn’t on CoSign yet as a local contact and still build the roster.
7. **As a user**, I cannot discover or edit works I’m not on (except via credit pack link).

---

## 8. Information architecture (screens)

1. **Auth** — login / signup  
2. **Home / Library** — list works, search, filters by type  
3. **Work detail** — overview, roster/splits, AKAs, lineage, activity, share  
4. **New work** — type, title, add people  
5. **Collaborators** — directory, add/invite  
6. **Collaborator detail** — profile fields, works in common  
7. **My profile** — rights wallet  
8. **Notifications**  
9. **Public credit pack** — tokenized read-only view  
10. **Marketing landing** (minimal)

---

## 9. Data model (logical)

```
User
  id, email, display_name, legal_name, pro_name, pro_ipi,
  publisher_name, publisher_ipi, contact_email, contact_social, notes, created_at

Contact (local collaborator card owned by a user)
  id, owner_user_id, display_name, legal_name, pro_*, contact_*,
  linked_user_id (nullable), created_at

Work
  id, type (sample|beat|song), primary_title, notes,
  cover_url, created_by, agreement_status (confirmed|pending),
  created_at, updated_at

WorkAka
  id, work_id, title, added_by, created_at

WorkLink
  id, work_id, label, url

Contribution
  id, work_id, user_id (nullable), contact_id (nullable),
  role, split_percent, confirm_status, offline_confirmed_at, offline_note

WorkLineage
  id, parent_work_id, child_work_id, relation (uses)

SplitProposal
  id, work_id, proposed_by, status (pending|approved|rejected|cancelled),
  payload (json: roster + percents), created_at, resolved_at

SplitProposalVote
  id, proposal_id, voter_user_id, vote (approve|reject), created_at

WorkEvent (audit)
  id, work_id, actor_user_id, type, payload_json, created_at

ShareLink
  id, work_id, token, created_by, expires_at (nullable), revoked_at

Notification
  id, user_id, type, payload_json, read_at, created_at

Invite
  id, email, invited_by, work_id (nullable), token, status, created_at
```

**Constraints (enforce in app + DB):**
- Contribution must reference user_id **or** contact_id
- Active contributions’ split_percent sum = 100 (on confirmed state)
- Unique AKA titles per work (case-insensitive)

---

## 10. Technical architecture

### 10.1 Recommended stack

| Layer | Choice | Why |
|-------|--------|-----|
| App framework | **Next.js (App Router) + TypeScript** | Web dashboard MVP fast; server actions + API routes; easy marketing pages; later Capacitor/PWA if needed |
| UI | **React + Tailwind CSS + shadcn/ui** | Fast, consistent, accessible components |
| Backend / DB | **Supabase (PostgreSQL)** | Relational model fits roster/approvals; RLS for private works; less custom backend |
| Auth | **Supabase Auth** | Magic link + Google; integrated with RLS |
| Realtime (optional MVP+) | **Supabase Realtime** | Live approval status on work page |
| File storage | **Supabase Storage** | Cover images (audio optional later) |
| Email | **Resend** | Transactional: invites, approval requests |
| Validation | **Zod** | Shared types/schemas |
| Hosting (app) | **Vercel** (default) | Best Next.js DX; preview deploys |
| Alt hosting | Cloudflare (Pages/Workers) if brand DNS must stay `*.befeast.com` only — possible but more friction with Next.js |

### 10.2 Modules (code boundaries)

```
apps/web (or repo root Next app)
  ├── auth          # session, guards, invites accept
  ├── profiles      # user wallet + contacts directory
  ├── works         # CRUD, search, AKAs, links, covers
  ├── contributions # roster, roles, split math
  ├── agreements    # proposals, votes, apply, offline confirm
  ├── lineage       # uses / used-by
  ├── share         # credit pack + public token page
  ├── notifications # in-app + email triggers
  └── audit         # work events
```

### 10.3 Security requirements
- Row Level Security: users only read/write works they contribute to
- Share links: token-based read-only; no PII beyond fields intended for credit pack
- All split mutations server-side only; never trust client for apply
- Audit log append-only
- Rate-limit invite + share-link creation

### 10.4 Environments
- `local` · `staging` · `production`
- Secrets: Supabase keys, Resend API key, app URL

---

## 11. MVP scope cut

### Must ship
- [x] Auth + profile PRO fields  
- [x] Contacts directory (local + invite)  
- [x] Works: sample/beat/song  
- [x] Roster + roles + even splits  
- [x] Approval flow for split/roster changes  
- [x] AKA titles + search  
- [x] Lineage uses-link  
- [x] Credit pack copy + share link  
- [x] Email notifications for approvals/invites  
- [x] Basic audit trail  

### Explicitly later
- PDF export / DocuSign-style e-sign  
- Audio upload + playback + fingerprinting  
- BeatStars sync/API  
- Packs as first-class type  
- Mobile native apps  
- AI features (auto-fill metadata, draft split sheets, conflict detection)  
- Auto-merge contacts on signup  
- Multi-currency / payment tracking  
- Team/manager seats  

---

## 12. Success metrics (MVP)

| Metric | Target (first 60 days post-launch soft) |
|--------|----------------------------------------|
| Activated user | Created ≥1 work with ≥1 collab |
| Time to first shared credit pack | < 10 minutes from signup |
| Approval completion rate | ≥ 50% of proposals resolved (approve or reject) within 7 days |
| Qualitative | Users stop “were you on this?” calls for logged works |

---

## 13. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Collabs don’t join app → approvals stuck | Local contacts + offline confirm; invites; value still as personal ledger |
| Domain “cosign” taken | Use cosign.app alternatives: getcosign.com, cosign.studio, cosignmusic.com, trycosign.com; brandable subdomain under befeast if needed |
| Users expect legal enforceability | Copy: “coordination tool, not a law firm”; timestamps + audit help but not court product |
| Split UX too heavy | Default even; approval only on *changes* |

---

## 14. Rollout plan (suggested)

1. **M0** — Design system + auth + profiles + contacts  
2. **M1** — Works + roster + even splits + AKAs + search  
3. **M2** — Proposals/approvals + notifications + audit  
4. **M3** — Lineage + credit pack share link  
5. **M4** — Polish, landing page, soft launch with real collab circle  

---

## 15. Open decisions (product)

| Item | Default for MVP | Change later if needed |
|------|-----------------|------------------------|
| Work types | sample, beat, song | add pack, stem, remix |
| Approval quorum | 100% of linked users on roster | timeout rules |
| Local contact votes | offline confirm by record editor | invite-only force |
| Share link expiry | none by default (revocable) | 30-day default |
| Mobile | responsive web | PWA → native |

---

## 16. Copy / brand (MVP UI)

- **Name:** CoSign  
- **Primary CTA:** “Co-sign this” (approve)  
- **Empty library:** “Log the session before you forget who was in it.”  
- **Pending banner:** “Splits changed — waiting on co-signs.”  

Domain TBD; product name locked as working brand.

---

## Document history

| Date | Change |
|------|--------|
| 2026-07-25 | Initial MVP PRD from ideation (provenance, PRO wallet, AKAs, approvals) |
