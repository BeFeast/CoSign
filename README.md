# CoSign

**Send, track, split.** A collab ledger for hybrid music creators (samples / beats / songs) — per-layer provenance, AKAs, lineage, and multi-party co-sign for split changes.

**The one-liner:** CoSign keeps a receipt for who owns what on every track you make — automatically — and taps you on the shoulder the moment one starts making money.

**The thesis (99/1):** ~99% of songs never earn, so admin-per-song is exactly why producers skip the paperwork. CoSign captures every track at ~zero cost and only asks for real paperwork on the 1% that shows signs of life. We take **0%** of royalties.

## Status

- **Live demo:** [cosign.befeast.com](https://cosign.befeast.com) — client-side MVP (React SPA, all data in `localStorage`, multi-user flows demoed via an identity switcher). **No backend yet.**
- **Next:** the **v1 send loop** ([spec](docs/specs/SPEC-v1.md)) — sign in, drag stems, pick a collaborator, set the split, send; the recipient downloads and accepts. The ledger builds itself as a byproduct of the send.

## Documentation

| Doc | What it is |
|---|---|
| [docs/HANDOVER.md](docs/HANDOVER.md) | **Start here for dev work** — current state, architecture, run/build/deploy, gotchas. |
| [docs/specs/SPEC-v1.md](docs/specs/SPEC-v1.md) | The v1 build spec (the send loop). Draft — open decisions pending. |
| [docs/specs/PRD.md](docs/specs/PRD.md) | Original MVP PRD (the client-side app implements it). |
| [docs/product/Ideation.md](docs/product/Ideation.md) | Problem, thesis evolution (v1→v3), competitive research, decision log. |
| [docs/product/EXPLAINER.md](docs/product/EXPLAINER.md) | Pitch cheat-sheet — the one-liner, 5/15-second versions, differentiation. |
| [docs/planning/2026-07-29-ideation.md](docs/planning/2026-07-29-ideation.md) | Ideation synthesis — current state of thinking in one doc. |
| [docs/planning/2026-07-29-discussion-agenda.md](docs/planning/2026-07-29-discussion-agenda.md) | Decision-forcing agenda for freezing SPEC-v1 (recommendations on the open decisions). |

Locked decisions will land in `docs/decisions/` as they are made.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm run typecheck  # tsc, no emit
node smoke.mjs     # headless smoke test (dev server must be running)
```

Stack: Vite · React 18 · TypeScript (strict) · React Router · Tailwind CSS · Zod. All domain logic sits behind `src/data/repo.ts` — the swap point for the real backend.
