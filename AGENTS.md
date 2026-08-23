# AGENTS.md — Wasla | وصلة

Guidance for AI coding agents (OpenCode & friends) working in this repository.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

**وصلة | Wasla** — SaaS platform connecting content creators with brands.
Creators get a public page at `/{username}`; companies discover creators and send offers.

- Stack: Next.js 16 (App Router, Turbopack, `proxy.ts`), TypeScript strict, Tailwind v4, shadcn/ui (Radix), Supabase (Postgres + Auth + Storage + RLS), Zod, React Hook Form, Vercel.
- Arabic **RTL is the default locale**; English LTR supported via the `wasla_locale` cookie. All UI strings live in `lib/i18n/dictionaries.ts` — keep `ar` and `en` keys in parity.

## Commands

```bash
npm install     # install
npm run dev     # dev server
npm run lint    # eslint — must pass with 0 problems
npm run build   # production build — must pass; never leave it broken
npm run db:push # apply supabase/migrations to the linked remote project
```

## Architecture rules

- Feature-based layout: `features/<domain>/{queries,actions}.ts` for data logic; UI components stay presentation-only. Never inline Supabase queries inside components.
- `"use server"` files may export **async functions only** — shared form-state constants/types go in sibling `form-state.ts` files.
- Server Components by default; add `"use client"` only when interactivity requires it.
- Validate all external input with Zod (`schemas/`). Route params/searchParams in Next 16 are Promises — await them.
- Bio block types are open-ended text validated app-side (`schemas/analytics.ts` pattern); unknown types must degrade gracefully, never crash a published page.
- Analytics events: `app/api/analytics/event/route.ts` derives `organization_id` from `bio_page_id` server-side — keep that attribution intact.

## Database & Supabase rules

- **All schema changes go through `supabase/migrations/*.sql`.** Never create/alter tables from the app or dashboard ad-hoc SQL for anything that should persist.
- Migration order matters and history is append-only: never delete/rewrite applied migrations, never run `supabase db reset`, `migration repair`, or force-push on the linked project without a diagnosed reason.
- **RLS is the security boundary.** Every private table must have policies; default posture is deny. Do not add broad policies like `using (true)` on private data. Marketplace tables stay policy-less (deny-by-default) until their feature phase.
- Storage uploads are scoped to `{auth.uid()}/...` top-level folders; public buckets: avatars/logos/images; private: media-kit/campaign-files.
- The app uses the anon/publishable key everywhere. **Never introduce `service_role` into client code, env examples, or docs.**
- INSERT..RETURNING evaluates rows through SELECT policies — when inserting parent rows whose visibility depends on later child rows (e.g. organizations before membership), generate UUIDs app-side and use minimal-return inserts (see `features/onboarding/actions.ts`).

## Git rules

- Branch `main`; conventional commits (`feat:`, `fix:`, `chore:`). No force-push, no resets on main, no rewriting history.
- `.env.local` and any secrets are git-ignored — verify with `git status` before committing. Never commit tokens, passwords, or keys.

## Testing checklist before finishing any task

1. `npm run lint` → clean.
2. `npm run build` → success.
3. If auth/db flows changed: exercise signup → onboarding → bio page against the linked Supabase project (see README setup).
4. Check both locales: switch language via the header toggle; RTL/LTR layouts must not break (use logical utilities `ms/me/ps/pe/start/end`).

## Scope discipline

Marketplace (campaigns, offers, negotiations, affiliate, payments) tables exist but features are intentionally unbuilt. Do not implement them, do not modify their deny-by-default state, and do not touch production data without an explicit task.
