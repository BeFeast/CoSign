# CoSign v1 — build spec (the send loop)

> Scope for the **first real version**. Turns Ideation's "thin send loop" into buildable decisions.
> Draft — review before any code. **Not built yet.**

## Goal (the one loop)

> A producer drags in exported stems, picks a collaborator, and sends. The collaborator gets an email, downloads the stems, and sees who's on it + the split. **The work + roster + split are logged as a byproduct of the send** — no separate admin step.

If 5 real producers do that end-to-end and come back to send again, v1 worked.

## In scope (v1)

1. **Auth** — sign in (magic link, no passwords).
2. **Send flow** — create a work (title + type) → drag/drop stems (upload) → pick recipient (email or existing user) → set the split (default even, editable) → optional message → **Send**.
3. **Email** — recipient gets "X sent you stems on *[title]*" with a link.
4. **Recipient page** — download the stems + see who's on it and the proposed split → **Accept** the split (that's the agreement) or just download.
5. **Catalog** — both people see the work + split in their library (reuse the existing Library/WorkDetail UI, now backed by the real DB).

## Out of scope (v1 — deliberately)

DAW bridge/plugin · AI instrument naming · filename parsing · PRO-status tracker / earnings / alerts · PDF split sheets / e-sign / contracts · escrow/payments · >2-party approval polish. These come after v1 proves the loop.

## Stack

- **Frontend:** the existing Vite + React + TS + Tailwind app (reuse the whole design system + Library/WorkDetail). Add the send + recipient screens.
- **Backend: Supabase** (covers all three needs in one):
  - **Auth** — magic-link email.
  - **Postgres + Row-Level Security** — data (below).
  - **Storage** — the stems (big files), with resumable uploads + signed download URLs.
  - **Edge Function** — send the "you got stems" email (via **Resend**) + issue signed links.
- **Hosting:** frontend stays on Cloudflare Pages; Supabase hosts the backend.

## Data model (minimal)

- `profiles` — id (→ auth user), display_name, handle, email, pro_name?, ipi?
- `works` — id, owner_id, title, type (sample|beat|song), bpm?, key?, created_at
- `contributions` — id, work_id, user_id?, contact_email?, contact_handle?, role, split_percent, confirm_status (pending|accepted)
- `sends` — id, work_id, from_user, to_email (or to_user), message, status, created_at
- `send_files` — id, send_id, storage_path, filename, size, content_type

## How it maps to the current code

- **`src/data/repo.ts` is the swap point** (already designed for this). Reimplement the *subset* the send loop needs (auth, works, contributions, sends, storage) against Supabase. The UI keeps calling `repo.*`; the localStorage impl is replaced.
- Keep the localStorage version behind a flag for the demo, or retire it once Supabase is live.
- **Reuse** the existing Library, WorkDetail, SplitBar, StatusPill, design tokens — they render real data instead of seed data.

## Hard bits (and how we handle them)

- **Big WAV uploads** → Supabase Storage resumable (TUS) or signed-URL direct upload, with a progress bar. Cap per send (e.g. **500 MB**) for v1.
- **Storage cost** → files/links **expire** (e.g. 30 days), then cleaned up. Bounds the bill.
- **Recipient isn't a user yet** → send is keyed by **email**; when they magic-link in with that email, the send + work attach to their new account (the "claim" = the growth loop).
- **Download without an account** → short-lived **signed URL** so they can grab files from the email link; require auth only to **Accept the split** (keeps friction low, still captures agreement).
- **RLS** → users only see works/sends they're a party to.

## Open decisions (need your call before build)

1. **Auth:** magic link (rec — lowest friction) vs add Google OAuth?
2. **Download gate:** allow download via link without an account (rec), or force sign-up first?
3. **Split in v1:** capture it — default even, editable (rec, it's the differentiator) — vs just send files and add splits later?
4. **File limits/retention:** OK with 500 MB/send + 30-day expiry for v1 to control cost?

## Milestone / definition of done

Sign in → create a work → upload stems → send to a collaborator by email → they receive it, download, and **both see the work + split in their catalog**. Watch: do senders send again, do recipients sign up.

## Rough effort

~1–2 weeks depending on polish. Biggest time sinks: **upload UX**, the **auth + claim flow**, and **RLS**. Everything downstream (filename auto-fill, PRO alerts) builds on this foundation.
