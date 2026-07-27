# CoSign — Handover

**A collab ledger for hybrid music creators** (samples / beats / songs). Tracks who made which layer, keeps PRO/credit info ready to share, remembers every title a work has had (AKAs), and requires multi-party approval before ownership splits change.

- **Product docs:** [`PRD.md`](./PRD.md) (MVP spec), [`Ideation.md`](./Ideation.md) (problem/thesis)
- **Status:** MVP built, working, deployed. Client-side only (no backend yet). Design refreshed 2026-07-26 (black + red, fully square, no emoji, first-launch tour).
- **Last updated:** 2026-07-27

---

## 0. 👋 Read me first — where we're headed next (the plan)

**The insight (from producer interviews):** producers won't adopt CoSign because it feels like *extra admin* after an already-draining post-production slog. They agree it saves time long-run, but the cost lands at the worst moment. **So CoSign has to read work they already do, not add a step.**

**The wedge:** producers already put everything in the **filename**, e.g. `Velvet 95bpm Gm @antn42 @timmyxholliday` → title `Velvet` · 95 BPM · `Gm` · roster `@antn42`, `@timmyxholliday`. Drop the file → CoSign fills it in. Zero new behaviour. (Full write-up + identity/verification thinking is in `Ideation.md` → "v2 direction — kill the admin tax".)

**How we build it — cheapest-validation-first. Do NOT build the backend until the filename drop makes producers go "oh."**

- **Phase 0 — the parser (next up, ~a few days, zero backend, client-side):**
  - `lib/parse-filename.ts` — pure function: detect BPM/key/@tags, title = whatever's left. Unit-test against real filenames.
  - New Work gets a **drop zone**: drop file(s) → prefill title/bpm/key/roster → **confirm card** (fix anything, never a silent write). Batch-drop a folder → list of draft works.
  - Small schema add: `bpm`/`key` on `Work`; roster can point at an **unclaimed tag** (today's "local contact" is already ~this).
  - 👉 Ship this, put it in front of the producers who were interviewed. If the "just drop the file" moment lands, the rest is worth building. If not, we learned cheap.

- **Phase 1 — tag = identity (still fakeable, no backend):** model a `ProducerTag` (canonical + aliases); users *claim* tags; unclaimed tag = placeholder. Filename tag resolves to a claimed tag/alias or auto-creates a placeholder. Still demoable via the "Viewing as" switcher.

- **Phase 2 — the backend (big lift, the real unlock):** the Supabase project that was always the deferred "next real thing" — auth, Postgres + RLS, reimplement `repo.ts` against it (that seam exists for exactly this; UI doesn't change). The **credit graph** (who-tags-whom) becomes real data → powers the collab directory, "you were credited" invites (viral loop), real email.

- **Phase 3 — verification + growth loop:** graph-weighted tag claiming (notability = in-degree) so `@metroboomin` can't be grabbed; social OAuth / bio-code proof + collaborator vouching; getting tagged pulls you in.

**Honest dependency:** the full vision (claiming, verification, cross-user graph, viral loop) *needs* real multi-user auth + backend — no way around it. We front-load Phase 0 to de-risk the thesis for ~free, then commit to the backend once it's proven.

**➡️ Decision waiting for you:** give the go-ahead to spec + build **Phase 0** (filename parser + drop-to-prefill), or discuss more first. That's the highest-signal, lowest-cost next move.

---

## 1. What this is (and isn't) yet

This is the **client-side MVP** path: a single-page React app with **all data persisted in the browser** (`localStorage`) behind a swappable data layer. It implements the entire PRD core loop end-to-end and is deployable as a static site.

Because there's no real backend/auth yet, the multi-party approval flow is demoed via an **"acting as" identity switcher** (top-right) — you step into any collaborator to send and co-sign proposals on one device. The seam for adding a real backend (Supabase) is the `repo` module (see §5).

**Not built yet (deferred, per PRD §11):** real auth/RLS, real email (Resend), PDF/e-sign, audio upload, BeatStars API, AI features, contact auto-merge.

---

## 2. Run / build / deploy

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm run preview    # serve the built dist/
npm run typecheck  # tsc, no emit
```

**Smoke test** (headless Puppeteer, walks the core flow + checks for console errors):
```bash
npm run dev &      # server must be up on :5173
node smoke.mjs      # exits non-zero on any failure
```

**Deploy** (Cloudflare Pages, from the anton host). `public/_redirects` (`/* /index.html 200`) makes SPA deep-routes work.

⚠️ **Do NOT run the full `/deploy` script for this project.** Its DNS step hardcodes `TARGET="${PROJECT}.pages.dev"` = `cosign.pages.dev`, which a stranger owns — running it PATCHes `cosign.befeast.com` away from the correct `cosign-3vs.pages.dev` and re-breaks the domain (see §3). Instead do a **content-only deploy**: `npm run build`, then Infisical-auth + `wrangler pages deploy dist --project-name=cosign --branch=main` (skip the DNS/CNAME step — DNS + custom domain are already correct and must stay untouched). Last done this way 2026-07-26 (deployment `33c2d6cc`), verified `cosign-3vs.pages.dev` and `cosign.befeast.com` both HTTP 200 off-LAN. The real fix is to patch the shared skill script to read the project's actual `.subdomain` for the CNAME target.

---

## 3. Deployment state & the DNS gotchas (READ before touching infra)

- **Live (works everywhere):** https://cosign-3vs.pages.dev
- **Custom domain:** https://cosign.befeast.com — attached on Cloudflare, serves correctly from the public internet.

Two non-obvious things bit us; both are documented in session memory (`~/.claude/projects/.../memory/befeast-split-horizon-dns.md`):

1. **pages.dev name collision.** `cosign.pages.dev` was already taken globally by an unrelated project, so this project's real subdomain is **`cosign-3vs.pages.dev`**. The deploy script assumed `<project>.pages.dev` and pointed the CNAME at the wrong (stranger's) site. Fixed by repointing `cosign.befeast.com` → `cosign-3vs.pages.dev`. If you redeploy and the domain breaks, re-check the real subdomain via `cf "/accounts/<acc>/pages/projects/cosign"` → `.result.subdomain`.
2. **LAN split-horizon DNS.** On the anton/homelab network, `*.befeast.com` resolves to a local **Nginx Proxy Manager** box (`10.10.0.20`), not Cloudflare — so `cosign.befeast.com` shows `ERR_SSL_UNRECOGNIZED_NAME_ALERT` from inside the LAN (no proxy-host/cert there for `cosign`). It works fine off-LAN (mobile data) and via `cosign-3vs.pages.dev`. To make it work on the LAN you must either add a proxy host in NPM (`cosign.befeast.com` → `cosign-3vs.pages.dev` + cert) or add a specific local DNS override. **This is still open** — decide with the owner before mutating homelab infra.

---

## 4. Tech stack

Vite • React 18 • TypeScript (strict) • React Router • Tailwind CSS • Zod (schemas) • nanoid (ids). No state library — a tiny external store over `localStorage` via `useSyncExternalStore`.

---

## 5. Architecture

```
src/
  data/
    schema.ts   # Zod schemas + TS types for every entity (mirrors PRD §9)
    db.ts       # localStorage store + subscribe(); writeDb() publishes a NEW
                #   top-level object each write (required for re-render — see note)
    repo.ts     # ★ ALL domain logic & CRUD. THE SUPABASE SWAP POINT.
    seed.ts     # deterministic demo data (the sample→beat→song north-star story)
    useDb.ts    # useSyncExternalStore hook — components subscribe to the whole DB
  session/      # (folded into repo.currentUser / setCurrentUser)
  lib/
    splits.ts       # even-split math, penny-accurate to 100.00
    credit-pack.ts  # builds the plain-text credit pack
    format.ts, ids.ts
  components/   # ui.tsx (Button/Card/Modal/Toast/Avatar/Badge/Tabs…), icons.tsx
                #   (SVG line-icons only, incl. workTypeIcon = waveform/pad-grid/mic),
                # Layout.tsx (nav + identity switcher; mounts WelcomeTour),
                # WelcomeTour.tsx (first-run headline + setup checklist),
                # SplitBar.tsx (proportional split viz + legend; segsFromRoster),
                # work-bits.tsx (WorkCard/WorkRow/WorkTableHeader, workStatus/StatusPill)
  screens/
    Landing, Library, NewWork, WorkDetail, Collaborators, CollaboratorDetail,
    Profile, Notifications, CreditPackPublic
    work/ ProposeModal.tsx, ShareModal.tsx
  App.tsx       # routes
```

**Key invariant (don't regress):** `writeDb()` in `db.ts` returns a **new** top-level object (`{ ...mutator(db) }`). Mutators edit the draft in place, but the shallow copy is what makes `useSyncExternalStore` see a changed snapshot and re-render. An earlier bug returned the same reference → data changed in storage but the live UI didn't update. The `smoke.mjs` co-sign step guards this.

**To add a real backend:** reimplement the functions in `repo.ts` against Supabase (auth + Postgres + RLS). The UI only ever calls `repo.*` and `useDb()`; it never touches the store directly. Swap `setCurrentUser`/`currentUser` for Supabase Auth and the identity switcher goes away.

---

## 6. Feature ↔ file map (all PRD §5 features present)

| Feature | Where |
|---|---|
| Library + search (title & AKA) | `screens/Library.tsx` |
| Create work | `screens/NewWork.tsx` → `repo.createWork` |
| Work detail (roster/splits/AKAs/lineage/activity/share) | `screens/WorkDetail.tsx` |
| Even splits + rebalance | `lib/splits.ts`, `repo.createWork` / `applyProposal` |
| Approval / co-sign workflow | `repo.openProposal` / `voteOnProposal` / `applyProposal`; UI in `WorkDetail` `ProposalBanner` + `work/ProposeModal.tsx` |
| Offline confirm (local contacts) | `repo.confirmOffline`, `OfflineConfirmModal` in `WorkDetail` |
| Titles & AKAs (rename keeps old as AKA) | `repo.renameWork` / `addAka`, `TitlesTab` |
| Lineage (uses / used-by) | `repo.addLineageUses` / `usesWorks` / `usedByWorks`, `LineageTab` |
| Credit pack (copy + public share link) | `lib/credit-pack.ts`, `work/ShareModal.tsx`, `screens/CreditPackPublic.tsx` (`/p/:token`) |
| Directory + local contacts + invites | `screens/Collaborators.tsx`, `repo.createContact` / `inviteByEmail` |
| Rights wallet (PRO fields) | `screens/Profile.tsx`, `repo.updateUser` |
| Audit log | `repo.logEvent` (WorkEvents), `ActivityTab` |
| Notifications | `repo.notify`, `screens/Notifications.tsx` |
| Onboarding (first-launch tour + Library strip) | `components/WelcomeTour.tsx`, `HowItWorks` in `screens/Library.tsx` (localStorage-gated) |
| Permission model | enforced in `repo` (catalog = anyone on work; ownership = proposal+approval; works private to contributors + share-link viewers) |

---

## 7. Design notes (refreshed 2026-07-28 "usability pass" — read before restyling)

Owner-driven direction: **black + red, near-square, no emoji, plain-language, split-bars.** Implemented from a design-doc export the owner supplied (three diagnoses: kill "co-sign" jargon, one "needs you" lane, splits as bars). Full details in session memory `cosign-design-direction.md`.

- **Near-square (changed from fully-square).** Containers/cards/rows stay `0px`; **interactive elements get 4px** — `borderRadius.sm = 4px` in `tailwind.config.js`, applied via `rounded-sm` on buttons/inputs/chips/badges. Don't round cards.
- **Accent = red `#e63b3b`** (`soft #f26d6d`, `dim #a82a2a`). One swap recolors everything. History: purple `#7b6bc7` (disliked) → orange-fire `#e5342b` (rejected) → current. Surfaces step up: page `#08080a` → card `#0a0a0c` → `#101014`/`#17171d`; lines `#1d1d24`/`#26262e`. ⚠️ Editing a theme **color** while `npm run dev` runs serves stale CSS — restart with `rm -rf node_modules/.vite` (memory `cosign-tailwind-jit-cache.md`).
- **IBM Plex Mono for all numbers** (loaded in `index.html`, set as `font-mono`) so percentages align. **No emojis** — SVG line-icons only (`workTypeIcon` = waveform/pad-grid/mic in `icons.tsx`). **Neutral avatars** (`hsl(24 7% L%)`).
- **Split bars are the core viz** — `components/SplitBar.tsx`: your share red, agreed others grey, unconfirmed **hatched** (`.hatch`/`.hatch-red` in `index.css`); `segsFromRoster()` + `SplitLegend`. Used in Library, WorkDetail (before/after diff + roster), ProposeModal.
- **Plain language, not "co-sign"** in UI (brand name/tagline stay). Status via `workStatus()`/`StatusPill` in `work-bits.tsx`: "Needs your approval" / "Waiting on others" / "All N agreed" / "X hasn't signed up". `repo.worksNeedingApprovalFrom(uid)` feeds both the Library "needs you" lane and status.
- **Screen changes:** Library = needs-you lane + "Your catalog" + grid/list toggle (`cosign.library.view`); list = split-bar table (`WorkTableHeader`+`WorkRow`); old "How it works" strip removed. Work detail = `ApprovalPanel` (before/after diff + who-has-to-agree roll call) + breadcrumb + tabs "People & splits / Other titles / What it's built on / History". Nav = Catalog / People / Activity / Your rights info (routes unchanged); "Log a work".
- **First run** = `WelcomeTour.tsx` (changed from 4-step carousel to headline "A 50/50 agreed in a DM is not a 50/50." + 3-item setup checklist), gated by `localStorage 'cosign.tour.v1'`. Identity switcher labeled "Viewing as · demo".

---

## 8. Open items / next steps

- [ ] **LAN access to `cosign.befeast.com`** — add NPM proxy host or local DNS override (needs owner's homelab access). Off-LAN it already works.
- [ ] Confirm Cloudflare custom-domain status flips `pending → active` (edge already serves 200).
- [ ] Backend: implement Supabase behind `repo.ts` (auth, DB, RLS, email) to make approvals genuinely multi-user.
- [ ] **Patch the shared `/deploy` skill script** to read the Pages project's real `.subdomain` for the CNAME target instead of hardcoding `${PROJECT}.pages.dev` — until then, deploy `cosign` content-only (see §2/§3).
- [ ] Optional: add an in-app "Replay intro" link (e.g. in Profile) that clears the tour localStorage keys.
- [ ] Test artifacts `smoke.mjs` / `shots.mjs` (kept, useful) and `puppeteer` devDep can be removed if you don't want the ~Chromium download.

---

## 9. Data model (see `src/data/schema.ts` for the source of truth)

`User`, `Contact` (local collaborator card), `Work` (sample|beat|song), `WorkAka`, `WorkLink`, `Contribution` (person+role+split%+confirm_status), `WorkLineage` (parent uses→ child), `SplitProposal` + `SplitProposalVote`, `WorkEvent` (audit), `ShareLink` (tokenized public pack), `Notification`, `Invite`. Constraints enforced in `repo`: contribution references a user OR a contact; confirmed splits sum to 100; AKAs unique per work (case-insensitive).
