# CoSign — Handover

**A collab ledger for hybrid music creators** (samples / beats / songs). Tracks who made which layer, keeps PRO/credit info ready to share, remembers every title a work has had (AKAs), and requires multi-party approval before ownership splits change.

- **Product docs:** [`PRD.md`](./PRD.md) (MVP spec), [`Ideation.md`](./Ideation.md) (problem/thesis)
- **Status:** MVP built, working, deployed. Client-side only (no backend yet). Design refreshed 2026-07-26 (black + red, fully square, no emoji, first-launch tour).
- **Last updated:** 2026-07-26

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
                # WelcomeTour.tsx (first-launch 4-step tour), work-bits.tsx (WorkCard etc.)
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

## 7. Design notes (refreshed 2026-07-26 — read before restyling)

Owner-driven direction: **black + red, fully square, no emoji, slick/flat.** Details also saved to session memory (`cosign-design-direction.md`).

- **Fully square.** Every Tailwind radius is `0px` in `tailwind.config.js` (`none/sm/DEFAULT/md/lg/xl/2xl/full` all `0px`), so every `rounded-*` is a hard edge. Don't reintroduce rounded corners.
- **Accent = red `#e63b3b`** (`soft #f26d6d`, `dim #a82a2a`) in the `brand` color — one swap recolors the whole app since everything references `brand`. History: original was purple `#7b6bc7` (disliked) → orange-fire `#e5342b` (rejected as "horrible") → current true red. ⚠️ Editing a theme **color** in `tailwind.config.js` while `npm run dev` is up keeps serving stale CSS (Tailwind JIT cache) — restart dev with `rm -rf node_modules/.vite` (see memory `cosign-tailwind-jit-cache.md`). `npm run build` is unaffected.
- **No emojis.** All emoji replaced by SVG line-icons. Work-type glyphs live in `components/icons.tsx` as `workTypeIcon` (IconSample=waveform, IconBeat=pad grid, IconSong=mic). Keep notification/toast copy emoji-free too.
- **Neutral avatars.** `Avatar` in `ui.tsx` renders warm-grey tiles (`hsl(24 7% L%)`, L nudged by the stored `avatar_hue`) so red stays the only real color. Don't restore colorful per-person hues without asking.
- **Flat surfaces:** no background glow, no button glow-shadow/scale bounce, crisp border on input focus (no ring). Radius/colors/component classes live in `tailwind.config.js` + `src/index.css` (`.card`/`.input`/`.chip`).
- **Onboarding.** First launch shows `WelcomeTour.tsx` (4 steps: what it is / why / how / demo note), gated by `localStorage 'cosign.tour.v1'`; finishing it also sets the Library strip key `cosign.onboard.library.v1`. Library also has a dismissible "How CoSign works" strip. To replay: clear those keys. The identity switcher is labeled "Viewing as · demo".

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
