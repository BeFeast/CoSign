# Ideation — Music Rights / Collab Provenance App

> Living brainstorm doc. **Not a PRD.**  
> PRD comes later (requirements, MVP scope, acceptance criteria).  
> This file captures: problem, who it’s for, product thesis, decisions, naming, open questions.

**Last updated:** 2026-07-28  
**Status:** Phase 1 locked · **Name: CoSign** (working) · MVP built · **v2**: adoption / kill the admin tax · **v3**: capture the 99%, paperwork on the 1% (see below)

---

## One-line thesis

A collab ledger for hybrid music creators that tracks **who made what layer** (sample / beat / song), **under which names**, with **PRO info ready to send** and **splits that only change when everyone approves**.

**Job of the app:** the layer *before and after* the marketplace (BeatStars, packs, releases).

> **Provenance + contribution memory for hybrid creators**  
> + a place where all PRO / credit info lives so you can send it without DM-hunting.

---

## Problem

### The pain in plain words
You and other producers make samples, beats, and tracks together. Months later:

1. Someone sells exclusive / a pack goes out / a big artist clears a sample.
2. Nobody fully remembers **who was on which layer**.
3. Hybrid creators blur roles (“did he make the sample, or only a beat with the sample?”).
4. The same work has **many names** (project file → BeatStars title → released song title) — different people remember different ones.
5. A label asks for **PRO info** for everyone → scavenger hunt across DMs.
6. Trust risk: someone could change 50/50 → 70/30 and you’d assume months later that you agreed.

BeatStars (and similar) solve **checkout / collaborator on a listing**.  
They do **not** solve **history, lineage, name aliases, or mutual agreement over time**.

### Core jobs-to-be-done
When a clearance, exclusive, release, or label request hits, instantly know:

- Which asset is being used  
- Who created which layer  
- What names it’s been known by  
- Who must be included / paid  
- How to send clean PRO + credit info  

Without relying on memory or group-chat archaeology.

---

## Who it’s for (primary wedge)

### Primary: Hybrid underground creators
- Make **samples and beats and sometimes songs**
- Collab in **rotating, trusted circles** (not fixed bands)
- Sell/distribute via BeatStars, packs, DMs, YouTube, etc.
- Default culture: **even splits among true creators of that layer** (fairness > micromanaging input)
- Occasionally hit real upside: exclusive sale, pack pickup, indie-artist clearance

### Secondary (later, not day-one)
- Indie artists needing clean credit packs  
- Managers / sync / boutique lawyers wanting catalog hygiene  

**Wedge choice:** creator-led bottom-up (not manager/lawyer OS first).

---

## Illustrative story (product north star)

You + 2 producers make a **sample**.  
A beatmaker makes a **beat** with that finished sample (he did *not* create the sample).  
Sample goes into a **pack**.  
A big indie artist (~200k monthly Spotify) uses the sample and needs **clearance**.  

Without the app: calls, memory tests, “wait was he on the sample or only the beat?”  
With the app: open the sample → roster is sample creators only → lineage shows intermediate beat as separate → share PRO/credit pack.

---

## Core product model

### Objects
1. **User / Collaborator profile**  
   - Linked platform user **or** local contact you create  
   - Name, PRO, IPI/CAE, publisher, contact, notes  
   - Local contact can later claim/merge when they join  

2. **Work / Asset** (typed)  
   - Sample / loop  
   - Beat  
   - Song / topline  
   - Pack (later)  
   - etc.  

3. **Contribution**  
   - Person + role on that asset (sample creator vs beat producer, etc.)  
   - Split % (default: even among creators of *this* asset)  

4. **Lineage**  
   - Beat **uses** Sample X  
   - Pack **includes** Sample X  
   - Release **clears / based on** Sample X  

5. **Title identity**  
   - Primary display title  
   - AKA / former titles (project name, marketplace name, release name) — all searchable  
   - Rename preserves old title as AKA  

### Core loop
```
Create / link collaborator profiles
  → Create track/asset + type
  → Add collaborators from directory (interchangeable, per-track)
  → Roles + default even splits
  → Optional: link lineage (uses Sample X)
  → Over time: add AKAs, notes, links
  → Split/roster changes = proposal + multi-party approval
  → Share credit / PRO pack to label or buyer
```

---

## Permission model (locked)

| What | Rule |
|------|------|
| Names, AKAs, notes, links, tags, cover | **Anyone on the track** (you only add people you trust) |
| Splits / adding-removing ownership parties | **Proposal → everyone must approve** (no silent 50/50 → 70/30) |
| PRO / personal profile fields | **Profile owner** (or you, for local contacts you created) |
| Record creation | Anyone; creator is initial record holder but catalog is shared among roster |

**Principle:**  
> **Catalog can be curated by the trusted roster; ownership can only be agreed.**

**Rename rule:** changing primary title auto-keeps the previous title as an AKA so nothing becomes unfindable.

---

## What this is / is not

| Is | Is not (day one) |
|----|------------------|
| Shared collab + provenance memory | Full music-lawyer ERP |
| Credit & contribution tracker by layer | BeatStars replacement |
| PRO / identity wallet for easy handoff | DistroKid / distributor |
| Mutual split confirmation | Complex publishing calculator first |
| Name/AKA history for findability | Manager suite / multi-client agency OS |

---

## v2 direction — kill the admin tax (from producer interviews, 2026-07-26)

**The signal:** producers agree CoSign saves time long-run but **won't adopt it** — it feels like *extra admin* piled on an already-draining post-production slog (strip beat → samples → send to collaborators → upload YouTube/BeatStars → cover art → naming). The cost lands at the worst possible moment. So the real constraint isn't "make logging nicer," it's:

> CoSign must **read work producers already do** — not add a step. It has to feel like it *removes* effort or costs ~zero, or it dies no matter how good the payoff.

### The wedge: read the filename (not ID3 metadata)

Producers already encode everything in the **file name** by habit, e.g.:

```
Velvet 95bpm Gm @antn42 @timmyxholliday
```
→ title `Velvet` · `95` BPM · `Gm` · roster `@antn42`, `@timmyxholliday`.

Drop file(s) → CoSign parses → prefilled work + roster. **Zero new behavior** — you already type this. Batch-drop a whole folder = instant catalog + collab graph (kills the empty-app cold start). Bonus: MP3s can also carry embedded cover art (`APIC`) to pull in.

> ID3/WAV metadata was the first idea but it's weaker: BPM/key only present if a tool wrote it, and **collaborators are never in metadata**. The filename carries the one thing that matters — *who's on it* — and it's a habit, not a new tool.

### Identity = a claimable "producer tag" (not a platform login)

- The string on the file is a **self-chosen credit alias**. (I write `antn42` on every sample even though my IG handle differs — it's the name I credit myself as, not any one platform.)
- You **claim your tag** + register **aliases** (`antn`, `anton42`…); optionally link socials underneath (for profile/clout, *not* for matching).
- A filename tag resolves to whoever claimed it → cross-platform inconsistency stops mattering.
- The `@` is **optional** — bare tags (`antn42`) must resolve too; the parser leans on known/claimed tags.

### Verification — stop me from grabbing `@metroboomin`

- Two layers: **account auth** (a real login = who you are) vs **tag claim** (which aliases route to you). Only the claim is squattable.
- **Squatting a tag can't steal money** — splits still require co-sign. So gate *proportionally*, not heavy KYC for everyone; verification only protects credit/clout.
- **Graph-weighted claiming:** obscure tag (few outside credits) = one-click, reversible by dispute. **Notable** tag (credited by many *independent* accounts) = auto-gated → must prove control (social OAuth **or** bio verification code + collaborator vouching). `metroboomin` is heavy in the graph, so it can't be silently grabbed.

### Parsing messy names — honest: it's ambiguous

Example `m85 95 antn42` → name `m85`, bpm `95`, prod `antn42`, via heuristics:
- fused letters+digits (`m85`) = **title** token, never BPM
- standalone integer ≈60–200 = **BPM**
- trailing token matching a **known/claimed tag** = **producer**
- **Always show a confirm/correct card** — never a silent wrong write.

Robustness comes from **learning each producer's convention after a few confirms** (per-user parser), *not* one universal regex. And the registry self-disambiguates as more tags get claimed (bare tags become recognizable). Some producers write nothing → graceful fallback to today's manual form with the filename as a title seed.

### Bidirectional bonus

Once a work exists, CoSign can **emit the canonical filename** to paste back — so it also fixes the consistent-naming pain for BeatStars/YouTube. Reads *and* writes the convention.

### v2 thesis (one line)

> **Claimable tag identity (graph-gated) + filename capture (heuristics → per-user learned) + co-sign (protects the money).** Three legs, mutually reinforcing. CoSign reads the filenames producers already write instead of asking for paperwork.

**New open questions (v2):**
- What threshold makes a tag "notable" enough to require hard verification?
- Which socials for OAuth / bio-code proof (IG, BeatStars, X)?
- First-drop universal parser scope vs. when per-user learned convention kicks in?
- Tag-namespace collisions + dispute/appeal flow?

---

## v3 direction — capture the 99%, do the paperwork on the 1% (synthesis, 2026-07-28)

Consolidates producer input (Gerion), Slack ideation, and a working DAW-plugin POC into one spine.

### The spine (reframes the whole thesis)

A producer noted: **~99% of songs never make money — doing admin on all 1000 to protect the 1% is why nobody does it.** So:

> **Capture everything with ~zero effort, then only do the real paperwork on the songs that show signs of life** (a placement, streams, a PRO gap while earning). Insurance that costs nothing until it pays off.

This unifies every idea collected: auto-capture makes the 99% free; a money-trigger fires on the 1%.

### The front door: stem-export → auto-send (the acquisition wedge)

The strongest way *in*. Via the DAW bridge, **export named stems and send them straight to a chosen collaborator** — no links, direct — in one action.

- **Chore-remover, not admin.** This is the "strip beat → samples → send to producers" slog from the *very first* interview — removed. Nobody opens a rights ledger; everybody would use a one-click "export + send my stems."
- **It captures what nothing else can: the collaborator.** Filenames/plugins get BPM/key but never *who's on it*. When you pick who to send to, CoSign knows **both parties + the lineage automatically** — the send *is* the provenance event. The ledger builds itself from an action they already do.
- **Two-part model:** stem-send = **acquisition wedge** (removes a chore + pulls the recipient in → network loop); PRO tracker / money-recovery = **retention + monetization**. "Come for the sender, stay for the ledger." Could even *feel* like a standalone producer stem-sender that builds the rights graph underneath.
- ⚠️ **Cost/risk to name:** moving files is real infrastructure — big WAV/stem uploads, storage + bandwidth, delivery notifications — heavier than today's localStorage ledger. "No links / direct send" means CoSign **hosts/relays the files** and the recipient basically has to be on CoSign (simultaneously the growth loop *and* a friction point).

### Layer 1 — Capture (make logging the 99% free)

A **ladder of on-ramps, each optional; the product must work at the top rung with no install:**
- **L1 · Filename ingestion (no install, default).** Parse `Velvet 95bpm Gm @antn42 @timmyxholliday` → work + roster. (See v2 above.)
- **L2 · Watched export folder (no install, auto).** Drop DAW exports in a folder, auto-ingest.
- **L3 · DAW plugin/relay (opt-in, power users).** POC **already built** (Oleg): a CoSign audio-FX plugin relays live session data — BPM, key, time-sig, track/project name — to a local Go backend (`cosign-server :9477`), cross-platform (DAW client → Go/Python server, Mac/Win/Linux). Deepest + exact metadata.
  - ⚠️ **Installing a VST is itself friction** — a turn-off for some. So the plugin is a *bonus layer, never the front door.* Filename/folder capture is the universal path; the plugin is for those who want exact BPM/key pushed automatically.
  - Note: the plugin gives *technical* metadata; **collaborators still come from the @handles** (filename/manual). It doesn't replace the identity wedge.

### Layer 2 — Trigger (monetize the 1%, from Gerion)

- **PRO Status Tracker** — flags songs *earning but unregistered*. The money-recovery hook, and the sharpest reason to sign up ("you're losing money right now").
- **Placement & Earnings Log** — manual entry or **CSV import from PRO statements**; the signal that a song matters.
- **Alerts** — "this song is generating revenue with incomplete PRO data."
- On trigger → generate the split sheet, register the PRO, pull in contacts/contracts. Paperwork happens *just-in-time*, not up front.

### Layer 3 — Source of truth (Gerion's operational catalog)

- **Song Vault** (≈ our Work) with an expanded per-song data model: ISWC/ISRC, release date; per-collaborator **PRO status + IPI**; **attached documents** (producer agreements, split sheets, contracts as PDF); **contacts** (manager/label/publisher/artist); **revenue tags** (sync/streaming/mechanical/performance/direct).
- **Song-linked contact book** — "who do I call if this blows up."
- **Signable split sheet + PDF export** (send it around).
- **Contracts per work + PDF redline diff** — when the lawyer returns edits, show what changed; even better as an AI "summarize the changes" feature.

### Positioning / differentiation

- **Operational tool, takes 0% royalty** (vs Songtrust/Sentric, who take a cut). The producer's *internal workflow tool*, not a collection service. Tracks **people + deals**, not just revenue.
- Still not a marketplace (BeatStars) or distributor — the layer before/after.

### Monetization

SaaS (per-song tier or flat monthly/annual) · optional paid **e-signature** add-on · **verified producer profile** (premium, for outbound placement opportunities).

### Moonshot / moat (far future)

**Track & Compare — AI audio fingerprinting.** Match samples by *sound* not filename ("does this exist / where's it been used"). Strongest long-term moat, but brutal cold-start (nothing to match until catalog volume) + cost. Note it, don't build near-term.

### Revised lean MVP (factoring 99/1 + no plugin dependency)

- Song entry + file/document upload (vault) — *mostly built.*
- **Filename ingestion** (zero-install capture) — the wedge.
- Split-sheet template + **PDF export**.
- Contact list linked to each song.
- **PRO status per collaborator + a simple "earning but unregistered" flag** (manual revenue log).
- Defer: DAW plugin, live PRO API, AI sample-match, PDF diff.

### Flags / open questions

- **Lead wedge?** Rec: *capture* is the on-ramp, *money-recovery (PRO tracker)* is the hook, *co-sign* becomes the signable-split-sheet feature (not the whole thesis).
- **The hard half:** the money-trigger needs real earnings/PRO data — CSV import is the pragmatic MVP; live PRO API later.
- **ICP:** prolific producers/writers with big backlogs (many throwaways + a few that could hit).
- Plugin stays optional forever; never gate the product on an install.

---

## Build plan — where we start (2026-07-28)

**Start with ONE thing: a thin "send" loop.** It's the acquisition wedge, it auto-builds the ledger (captures both people + lineage), and it forces the backend everything else needs. Don't keep adding to the localStorage demo — that's a dead end for the real product; `repo.ts` is the swap point.

### v1 — the send loop (no DAW bridge, no AI)

The dumbest version that tests the wedge:
- A web/desktop **drop**: drag exported stems → **"Is this a collab? with who?"** (pick a contact / @handle / email) → **send**.
- Backend: real accounts (**auth**) + **file storage** + a "send" record + **transactional email** with a download link.
- Recipient downloads; if not a user, the email **pulls them in** (network loop).
- The split/roster is logged as a **byproduct of the send** — no separate admin step.

### The naming question (guitar / piano / drums) — track name first, AI later

- **Use the track name the producer already set** ("Guitar Wet", "Bass DI", "Drums MIDI") — free, reliable, ~90%. The DAW bridge just reads it.
- **AI instrument recognition** (YAMNet / audio-tagging / stem-separators like Demucs) exists but is heavier + imperfect (processed synth vs piano vs pad is ambiguous) → **fallback only for unnamed "Audio 1" channels, always confirmable.** Don't build the classifier first.

### Sequence after v1

1. Send loop (above).
2. **DAW bridge** (M4L Ableton / controller ext Bitwig) auto-catches the export + reads track names — removes the manual drop. Optional layer (install is friction).
3. AI instrument-naming for unnamed channels.
4. **Filename auto-fill**, then **PRO-status + earnings (CSV) + alerts** (retention/money), then contracts/PDF.

### Effort honesty

- **Easy:** track-name read, the "collab? who?" dialog, contacts.
- **Medium:** file upload + storage + email (real cost — stems are big WAVs; need resumable upload + link expiry).
- **Hard/later:** AI recognition, reliable cross-DAW export detection, full DAW coverage.

### Don't build (now / maybe ever)

- **AI sample-match fingerprinting** — far-future moat (cold-start + cost).
- **DAW plugin *first*** — friction + per-DAW fragmentation; it's polish, not the front door.
- **Live PRO API** — huge lift; use **CSV import** early.
- **Placement marketplace / "verified profiles"** — a BeatStars pivot; resist.
- **Heavy per-song metadata (ISWC/ISRC) up front** — the admin you're killing; only on the 1% that earn.
- More **co-sign UI polish** — already built; it's a feature now, not the product.

**First real milestone:** one send loop, end-to-end, used by ~5 real producers — watch if they come back.

---

## Naming brainstorm

### Naming criteria
- Memorable, easy to say / spell  
- Fits music + trust/credit (not only “fintech spreadsheet”)  
- Works for samples *and* beats *and* songs  
- Domain / social handle plausibility (to check later)  
- Doesn’t box us into “only split %” if product is really provenance + credit  

### Name shortlist (10)

| # | Name | Vibe | Why it fits |
|---|------|------|-------------|
| 1 | **CoSign** | Creator / culture | In music, a co-sign is a stamp of approval — maps to mutual split approval + “you were on this” |
| 2 | **Byline** | Short / credit | Like a writer’s byline: who made this. Clean, premium, about credit not just % |
| 3 | **Roster** | Utility / punchy | Who’s on the track. Dead simple. Slightly generic but clear |
| 4 | **Stamp** | Short / trust | Provenance stamp; approved; official. Very product-shaped |
| 5 | **Layer** | Modern / abstract | Sample vs beat vs song layers — unique to our insight. Risk: abstract |
| 6 | **Origin** | Modern / provenance | Where the work came from; chain of origin. Strong clearance story |
| 7 | **Faircut** | Creator / splits | Even-split culture, fairness. Clear value prop; may sound “only about %” |
| 8 | **Credline** | Fintech-ish / credit | Credit line for creators. Descriptive; a bit invented |
| 9 | **Clearpath** | Utility / clearance | Path to clearance-ready. Good outcome name; less collab-memory feel |
| 10 | **Imprint** | Premium / brand | Leave your imprint on a work; also label terminology. Stylish |

### Other sparks (backup)
Splitproof · Trackstack · InTheRoom · TagIn · RollCall · OnRecord · CueSheet (maybe too traditional) · MakerMark · SessionLog · Chainlist · Provenote · EvenSplit

### Chosen working name: **CoSign**

- **Tagline:** “If you were on it, co-sign it.”  
- **Alt:** “Collabs confirmed. Credits clear.”  
- **Domain:** likely hard to get exact `cosign.com` — check getcosign.com / cosign.studio / cosignmusic.com / trycosign.com / befeast subdomain  
- Runners-up: Byline, Stamp

---

## Feature backlog (placeholder — Phase 2)

*Not prioritized yet. Expand in Phase 2.*

**Must-explore**
- [ ] Collaborator directory (linked user + local contact)
- [ ] Asset types + roles
- [ ] Default even splits + approval workflow
- [ ] Title + AKA history / search
- [ ] PRO wallet → shareable credit pack
- [ ] Lineage (uses / derived from)
- [ ] Audit log on agreement changes

**Ideas to expand later (Phase 2)**
- AI contract / split sheet generation  
- Sample clearance tracking  
- Audio fingerprinting  
- Automated email / link sign-offs  
- Exportable PDF split sheets  
- BeatStars complementarity checklist  
- …  

**AI killer features** — TBD Phase 2  

---

## MVP vs later — TBD Phase 4

| Must-have MVP | Nice-to-have later |
|---------------|-------------------|
| *Fill after Phase 2–3* | *Fill after Phase 2–3* |

---

## Open questions

- [ ] Final name + domain check  
- [ ] Asset types for MVP: sample + beat only, or song too?  
- [ ] How heavy is e-sign vs simple in-app “I confirm”?  
- [ ] Audio upload vs links to files only for MVP?  
- [ ] Geography / PRO defaults (US-first vs global)  
- [ ] Notification channels (email, push, in-app only)  

---

## Decision log

| Date | Decision |
|------|----------|
| 2026-07-25 | Primary wedge = hybrid creators (not managers first) |
| 2026-07-25 | Core = provenance + contribution memory + PRO handoff, not marketplace |
| 2026-07-25 | Collaborators = interchangeable directory, attached per track |
| 2026-07-25 | Default splits = even among creators of that layer |
| 2026-07-25 | Lineage matters (sample ≠ beat made from sample) |
| 2026-07-25 | AKA / multi-name history is core, not polish |
| 2026-07-25 | Catalog edits = anyone on track; splits = multi-party approval |
| 2026-07-25 | Ideation lives in `Ideation.md`; PRD is a later separate doc |
| 2026-07-25 | Working name locked: **CoSign** |
| 2026-07-25 | MVP PRD created: `PRD.md` |
| 2026-07-26 | Interviews: adoption blocker = feels like extra admin post-production → v2 goal is to *read work already done*, not add a step |
| 2026-07-26 | Adoption wedge = **filename ingestion** (parse producer file-naming convention → auto-fill work + roster), not ID3 metadata |
| 2026-07-26 | Identity primitive = **claimable producer tag + aliases** (not a platform login); socials link underneath |
| 2026-07-26 | Tag-claim verification is **graph-weighted**; squatting a tag can't move money (co-sign protects splits) |
| 2026-07-26 | Filename parser = heuristics + **always-confirm** + **per-user learned convention** (no universal regex) |
| 2026-07-28 | v3 spine: **capture the 99% for free, do paperwork on the 1% that earns** (99% of songs never make money) |
| 2026-07-28 | DAW plugin POC works (Oleg) but a VST install is friction → **plugin is an optional deep layer, filename/folder capture is the front door** |
| 2026-07-28 | Adopt Gerion's **money-recovery hook** (PRO status tracker + earnings log + alerts) and **0%-royalty operational-tool** positioning (vs Songtrust) |
| 2026-07-28 | Priority: capture = on-ramp, money-recovery = hook, co-sign = signable-split-sheet feature (not the whole thesis) |
| 2026-07-28 | AI audio fingerprinting (Track & Compare) = far-future moat, not near-term (cold-start + cost) |
| 2026-07-28 | **The send is the front door:** stem-export → direct auto-send = the acquisition wedge (a chore-remover that captures both parties + lineage). Money-recovery = retention. Flag: real file-hosting infra/cost |
| 2026-07-28 | **Build start = thin send loop** (drop stems → "collab? who?" → email link); forces the backend (auth + storage) everything needs |
| 2026-07-28 | Channel naming = **track name first**; AI instrument-recognition only as fallback for unnamed channels (don't build the classifier first) |
| 2026-07-28 | DAW bridge + AI naming are **automation polish, not v1** — validate the send loop with a plain web/desktop drop first |

---

## Ideation vs PRD (how we’ll use docs)

| Doc | Purpose |
|-----|---------|
| **Ideation.md** (this file) | Problem, users, thesis, branding, decisions, idea parking |
| **PRD** (later) | What we will build for v1: scope, user stories, requirements, out-of-scope, success metrics |

Do **not** dump full requirements here. Keep this readable for product thinking.

---

## Next steps

1. Pick / shortlist a name (and backups if domain taken)  
2. Phase 2 — feature expansion + 2 AI killer features  
3. Phase 4 — MVP vs later cut  
4. Then write PRD  
