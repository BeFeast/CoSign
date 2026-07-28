# CoSign — discussion agenda: sharpening v1

> Prep for the next working discussion. The ask: input on **"what v1 is ACTUALLY going to be"** ([`SPEC-v1.md`](../../SPEC-v1.md) = the send loop). This doc turns that ask into a decision-forcing agenda: every item below ends in a call we can write down, not a vibe. The root docs (SPEC-v1, Ideation, EXPLAINER, HANDOVER) are the source material; this note adds the recommendations and the trade-off reasoning.

## 1. Purpose

**Goal of the meeting:** leave with the blocking decisions made, SPEC-v1 amended and frozen, and a named validation cohort — so the build can start the next day.

**Not the goal:** re-litigating the v3 thesis (capture the 99%, paperwork on the 1%) or the competitive repositioning — those are settled in the decision log. This meeting is about the *first buildable slice*.

## 2. The four blocking decisions

These are the open decisions from SPEC-v1 / the handover. For each: options, a concrete recommendation with reasoning, and the cost of changing the call later. The point of the table: three of the four are cheap to reverse — so decide fast and move.

| # | Decision | Options | Recommendation | Cost to change later |
|---|----------|---------|----------------|----------------------|
| 1 | **Auth** | (a) magic link only · (b) magic link + Google OAuth | **(a) Magic link only.** The whole claim flow is keyed by email — the recipient signs in with the address the send was addressed to, and the work attaches to them. Magic link *is* that flow; Google adds a second identity path (which Google email?) plus OAuth config, for zero adoption gain with a 5-person cohort. | **Low.** Adding an OAuth provider later is additive on the same auth backend; nothing schema-level changes. |
| 2 | **Download gate** | (a) download via short-lived signed link, no account · (b) force sign-up before download | **(a) No account to download; account only to *accept the split*.** The recipient experience is the growth loop — a sign-up wall in front of "get your stems" kills the one thing v1 must prove. Accepting the split is where identity actually matters, so gate exactly that. | **Low mechanically** (a toggle), but it changes what the validation measures: with (a) we learn download→signup conversion; with (b) we'd only learn bounce rate. Start open, tighten if abuse shows up. |
| 3 | **Split capture in v1** | (a) skip splits, just send files · (b) require full % on send · (c) **people required, % optional** (prefilled even, editable, never blocks the send) | **(c).** The split-as-byproduct is the entire differentiator vs a file-sender — dropping it (a) makes v1 a worse WeTransfer. But making % a mandatory form field (b) reintroduces the admin tax at the exact moment we claim to remove it. Prefill even, let the sender adjust or ignore, log it either way. | **Medium.** The schema carries `split_percent` from day one either way; what's expensive to retrofit is *meaning* — if v1 ships without any split capture, the "ledger builds itself" story has no data behind it when we come back for it. |
| 4 | **File limits / retention** | (a) 500 MB/send, 30-day expiry (SPEC draft) · (b) **1 GB/send, 30-day file expiry, ledger record forever** | **(b).** WAV math: a ~4-min 24-bit/48k stereo stem is roughly 80–100 MB; a normal 8–12 stem export busts 500 MB routinely, and "your session doesn't fit" on the first send is a fatal first impression. 1 GB covers the typical case; 30-day expiry bounds storage cost; the *ledger* (work, roster, split, send event) must never expire — files are transport, the record is the product. | **Caps: trivial** (config numbers). **Retention promise: one-way.** Extending expiry later is fine; shortening it after telling users "30 days" burns trust. Say the number once, correctly. |

**Meeting output for this section:** four written calls, appended to SPEC-v1's decision list. Recommendation: accept all four as stated unless someone brings a new fact.

## 3. Direct input on SPEC-v1 (the requested review)

### What the spec gets right — don't reopen

- **The scope cut is the best thing in it.** No DAW bridge, no AI naming, no filename parsing, no PRO tracker in v1 — correct. The send loop forces auth + storage + email, the backbone everything later needs.
- **`repo.ts` as the swap point** — the UI never touches storage directly, so the localStorage MVP converts instead of being rewritten. This was designed for exactly this moment.
- **Send keyed by email + claim on sign-in** — the growth loop and the identity model in one mechanism.
- **One backend covering auth/DB/authz/storage/email in a single place** — the *shape* is right; where it runs is challenged below (§3.7).
- **The milestone definition** ("both parties see the work + split in their catalog; watch for repeat sends") is a real falsifiable test, not a feature checklist.

### What to challenge in the meeting

1. **Is "Accept" enough of an agreement?** The spec's recipient page has one verb: Accept. Real reactions are accept / *disagree with the %* / ignore. Proposal for v1: **Accept or leave pending — no counter-offer flow.** A counter is a split *proposal*, and the multi-party proposal machinery already exists in the client MVP; wiring it cross-user is real scope. But we must decide what a lingering "pending" means in both catalogs (recommend: visible, nagging, harmless) and confirm that "Accepted" copy stays honest — it is a recorded agreement with a timestamp, not an e-signature. Don't let the UI imply legal weight we don't have.
2. **Multi-recipient sends.** Spec reads as strictly 1→1, but a session with three collaborators is normal. Two cheap outs: (i) roster on the work can hold N people even if the *send* goes to one, (ii) "send to another collaborator" re-uses the same work. Decide: is 1→1-per-send an acceptable v1 constraint (recommend yes), and does the data model make N-sends-per-work free (it should — `sends` is already separate from `works`)?
3. **Claim-flow edge cases** — the actual hard part of the build, underweighted in the spec:
   - *Email mismatch:* stems sent to an old address, recipient signs up with a new one. The claim silently fails. v1 answer: sender can re-send to a corrected address; no support tooling.
   - *Forwarded link:* the signed URL travels with the email. Whoever holds it can download (acceptable — expiry bounds it), but **accepting the split must require signing in with the addressed email**, otherwise the ledger records the wrong person's agreement. This rule needs to be explicit in the spec.
   - *Expired files, unaccepted split:* after 30 days the download dies but the pending split remains. Fine — state it, so it's a behavior, not a bug report.
4. **The cap number** — resolved above (decision 4), but the spec text still says 500 MB and must be edited on freeze.
5. **Sender-side controls:** can a sender revoke a send or re-issue an expired link? Recommend: re-send yes (cheap, same mechanism), revoke no (v1 doesn't need it).
6. **Effort estimate sanity:** the spec's own estimate is optimistic and only holds with the scope above kept rigid — don't commit to exact dates. The three sinks the spec itself names — upload UX, claim flow, authz — are the real timeline; every §3 item we answer with "the simple option" protects it.
7. **Why hosted Supabase? (backend hosting is an open decision, not a given.)** The spec picks hosted Supabase; the alternative is running the MVP backend on our own infrastructure, where Postgres already runs. Honest trade-off:
   - *Self-hosting pros:* existing Postgres and storage (effectively free for 1 GB-scale sends), no vendor bill, no lock-in, full control — infra the team already operates daily.
   - *Self-hosting cons:* the backend is exposed to external users (producers uploading/downloading through the public edge), uptime during validation becomes our pager, and the three things hosted Supabase gives for free — magic-link auth, resumable/signed-URL uploads, row-level authz — get hand-built or self-assembled.
   - *Middle path worth tabling:* **self-hosted Supabase on our own hardware** — same API surface and features, no bill; keeps the `repo.ts` swap identical, and migrating to hosted Supabase later is a connection-string move, not a rewrite.
   - Decide on cost-of-validation vs ops burden; whichever way it goes, the client code must stay behind `repo.ts` so hosting stays swappable.

## 4. Validation: "5 real producers send twice"

The milestone needs operational definition or it will drift into "some people tried it."

| Question | Proposal |
|----------|----------|
| **Who are the 5?** | The producer interview circle (the people behind the admin-tax and 99/1 insights — they already articulated the problem) + industry contacts for 1–2. Criteria: actively exporting/sending stems to collaborators *this month*, not friends-being-nice. **Meeting output: five names, or the gap owned by someone.** |
| **What counts as success?** | Per producer: ≥2 sends where the *second* is unprompted, reasonably soon after the first (agree the observation window in the meeting — don't hard-code a number now). Cohort: ≥3 of 5 hit it. Secondary signals: recipient download rate, recipient sign-up rate, % of sends where the split was accepted. |
| **What counts as failure?** | First sends happen (novelty) but no seconds → the chore-remover isn't actually removing a chore; revisit whether the manual web-drop is too far from the export moment (which strengthens the DAW-bridge case, see §5). |
| **How fast can we learn?** | Sequence, not dates: build → onboard the 5 personally (calls, not emails) → observation window → verdict. No exact timeframes — estimates here compound too many unknowns. Instrument from day one: send created, download completed, split accepted, repeat send — four events, no analytics product needed. |
| **Feedback channel** | One shared chat with the cohort + a short call after each producer's second send (or after the window passes in silence). |

## 5. Strategic questions to align on (timeboxed — none block the build)

1. **Positioning vs SessionSplit / Sound Credit.** The competitive scan's conclusion stands: "send stems + split sheet" is occupied, and "0% royalty" doesn't differentiate against these two. So: **build the send loop, but never pitch it as the product.** The send is acquisition plumbing; the story is auto-capture + "this song is earning while unregistered." Align that all outward-facing copy (landing, EXPLAINER-derived pitches) leads with capture/money-recovery even while v1 only ships the sender. Also worth 10 minutes: what does SessionSplit's existence *teach* us — their escrow/verified-credits angle is exactly the admin-first posture we're betting against.
2. **DAW bridge: v2 bet or demo asset?** Recommendation: **demo asset now, bet later, decided by data.** It's the wow-moment in any pitch and proof the deep integration is real. But it's per-DAW fragmentation and install friction, so it earns build priority only if validation shows the web-drop is too far from the export moment (§4 failure branch). Don't schedule it; let the cohort's behavior schedule it.
3. **Naming (deferred) — does it block anything?** Almost nothing. One real touchpoint: the transactional email needs a sender name and from-domain, and that's the first brand impression every recipient gets. Decide the email's display name and subject line style in this meeting (10 minutes, copy decision, not a naming decision) and keep the name question parked until launch as agreed.
4. **Monetization timing.** Nothing to charge for in v1 and charging would contaminate validation. Align on the *trigger*, not a date: monetization talk reopens when the money-recovery layer (PRO status + earnings) exists, since that layer is the stated retention/monetization engine. Park the SaaS/e-sign/verified-profile ideas in the backlog until then.

## 6. After the meeting: decision → freeze → build

1. **Same day:** write the decisions + §3 resolutions into SPEC-v1 (edit the 500 MB line, add the accept-requires-addressed-email rule, state expiry behavior). Mark the spec **frozen for v1** — changes after this point cost a conversation, not a commit.
2. **Build:** implement per spec against the existing app via the `repo.ts` swap; localStorage demo retired or flagged.
3. **In parallel:** the five producers get locked, onboarding calls scheduled, email copy drafted.
4. **Then:** validation window per §4; decision review with the four-event data on the table.

**Where things live** (so the two surfaces don't drift):

| Surface | Holds |
|---------|-------|
| **Management workspace** (private) | Meeting outcomes/decision notes with reasoning, PM tracking, validation results, session handovers. |
| **Code repo** (`docs/` + root) | The code, SPEC-v1 (the frozen build contract), PRD/Ideation/EXPLAINER, and the synced planning docs (`docs/planning/`, locked decisions in `docs/decisions/`). The source of truth for *what is built*. |

Decisions get recorded twice on purpose: the *decision + reasoning* as a management note (synced to `docs/`), the *resulting spec change* as a repo commit.
