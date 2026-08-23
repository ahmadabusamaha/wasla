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

## Stack

- Next.js 16 (App Router, Turbopack, `proxy.ts`), TypeScript strict
- Tailwind CSS v4 + shadcn/ui (Radix)
- Supabase — PostgreSQL + Auth + Storage + Row Level Security
- Zod + React Hook Form
- Vercel

## Architecture

```
auth.users
    ↓
profiles
    ↓
organizations
    ↓
organization_members
```

**Critical distinction:**
- **Creator** = Organization (type = 'creator')
- **Company** = Organization (type = 'company')
- **Admin** = Platform-level role, **NOT** an Organization type

The `organizations` table has a `type` enum: `'creator' | 'company' | 'agency'`. The `Admin` role is a platform-level concept (stored in user metadata or a separate admin table), NOT an organization type. Admins are created via database directly, never through public signup.

## Roles & Permissions

### Platform Admin
**Capabilities:**
- View all users, companies, creators, organizations
- Edit any Company/Creator data
- Disable/enable any Company/Creator account
- Delete/hide violating content
- Edit any Creator's Bio Page
- Review/approve Companies and Creators (verification status)
- View all campaigns, offers, transactions
- Platform analytics dashboard
- Manage Categories, Plans, Platform settings
- Manage Reports, Notifications, Marketplace
- Content moderation

**Restrictions:**
- No automatic access to user passwords or sessions
- "Login as user" / Impersonation requires a separate secure system with Audit Log (not implemented)

### Company
**Capabilities:**
- Manage Company Profile (logo, website, industry, location)
- Add/manage team members with roles (`company_manager`, `marketing_manager`, `employee`)
- Discover and view Creator profiles & public social accounts
- Create Campaigns
- Send Offers (cash, product, commission, affiliate, hybrid)
- Manage Offers (track, negotiate)
- Manage own Campaigns
- View own campaign results & analytics
- Manage Affiliate programs & links
- View own Transactions
- Company Settings

**Restrictions:**
- Cannot view other Companies' private data
- Cannot edit Creator profiles
- Cannot access Admin Dashboard
- Cannot modify Platform settings
- Cannot view other Companies' transactions
- Cannot bypass RLS

### Creator / Influencer
**Capabilities:**
- Manage Creator Profile (avatar, bio, location, categories)
- Manage Social Accounts (Instagram, TikTok, YouTube, etc.)
- Add/manage Categories
- Build Bio Page (settings, blocks CRUD: links, social, headings, text, images, videos, brands, affiliate, discounts)
- Arrange blocks (drag/reorder), toggle visibility, delete
- Publish/Unpublish Bio Page
- View personal Analytics
- Receive/manage Offers (accept, reject, counter)
- Track Campaign participation
- View Earnings & Affiliate performance
- Manage Discount Codes
- Personal Settings

**Restrictions:**
- Cannot view other Creators' private data
- Cannot edit other Creators
- Cannot access Company Dashboard
- Cannot edit Company profiles
- Cannot access Admin Dashboard
- Cannot view other Creators' Offers or financial data

## Security Rules

- **Never use `service_role` key in client code, env examples, or docs.**
- **Never commit secrets** (Supabase keys, GitHub tokens, Vercel tokens, OpenCode API keys) to Git.
- `.env.local` and any secrets are git-ignored — verify with `git status` before committing.
- **RLS is the primary security boundary.** Every private table must have policies; default posture is deny.
- Do not add permissive policies like `using (true)` on private data. Marketplace tables remain policy-less (deny-by-default) until their feature phase.
- Storage uploads are scoped to `{auth.uid()}/...` top-level folders. Public buckets: avatars, logos, images. Private: media-kit, campaign-files.
- App uses anon/publishable key everywhere. **Never introduce `service_role` in client code, env examples, or docs.**
- **Frontend authorization is not security.** Always enforce at RLS/Database level.
- Do not use `USING (true)` on private data.
- Do not modify Production migrations after they are applied. Add new migrations for changes.
- Never run `supabase db reset` on Production. Never use `supabase migration repair` without a diagnosed migration history issue.
- **Never force-push.** No rewriting history on `main`.
- `INSERT .. RETURNING` evaluates rows through SELECT policies — when inserting parent rows whose visibility depends on later child rows (e.g., organizations before membership), generate UUIDs app-side and use minimal-return inserts (see `features/onboarding/actions.ts`).

## Development Rules

**Before any modification:**
```bash
git status
```

**Code standards:**
- Feature-based layout: `features/<domain>/{queries,actions}.ts` for data logic; UI components stay presentation-only. Never inline Supabase queries inside components.
- `"use server"` files export **async functions only** — shared form-state constants/types go in sibling `form-state.ts` files.
- Server Components by default; add `"use client"` only when interactivity requires it.
- Validate all external input with Zod (`schemas/`). Route params/searchParams in Next 16 are Promises — await them.
- Bio block types are open-ended text validated app-side; unknown types must degrade gracefully, never crash a published page.
- Analytics events: `app/api/analytics/event/route.ts` derives `organization_id` from `bio_page_id` server-side — keep that attribution intact.
- Arabic **RTL is the default locale**; English LTR supported via `wasla_locale` cookie. All UI strings in `lib/i18n/dictionaries.ts` — keep `ar` and `en` keys in parity.
- INSERT..RETURNING evaluates rows through SELECT policies — when inserting parent rows whose visibility depends on later child rows (e.g. organizations before membership), generate UUIDs app-side and use minimal-return inserts (see `features/onboarding/actions.ts`).

**Before finishing any task:**
1. `npm run lint` → clean (0 errors, 0 warnings preferred)
2. `npm run build` → success
3. If auth/db flows changed: exercise signup → onboarding → bio page against the linked Supabase project
4. Check both locales: switch language via header toggle; RTL/LTR layouts must not break (use logical utilities `ms/me/ps/pe/start/end`)

**Git discipline:**
- Branch `main`; conventional commits (`feat:`, `fix:`, `chore:`). No force-push, no resets on main, no rewriting history.
- `.env.local` and secrets are git-ignored — verify with `git status` before committing. Never commit tokens, passwords, or keys.

## GitHub / OpenCode Agent Workflow

```
GitHub Issue / PR comment with @opencode
       ↓
OpenCode GitHub Agent picks up the task
       ↓
Agent reads AGENTS.md, explores codebase
       ↓
Agent makes changes, runs lint/build/tests
       ↓
Agent commits, pushes, opens PR
       ↓
GitHub → Vercel Preview Deploy
       ↓
Review → Merge to main
       ↓
Vercel Production Deploy
```

**OpenCode GitHub Agent Setup:**
1. Install OpenCode GitHub App on the organization/repo: https://github.com/apps/opencode
2. Add `.github/workflows/opencode.yml` (see workflow file)
3. In GitHub repo settings → Secrets → Actions, add:
   - `OPENCODE_API_KEY` (from https://opencode.ai/settings)
   - Provider key: `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` (whichever provider)
4. Trigger: mention `@opencode` in an Issue comment or PR comment

The agent will:
- Read AGENTS.md and explore the codebase
- Implement the requested changes
- Run `npm run lint` and `npm run build`
- Commit changes and open a PR
- Vercel automatically creates a Preview deployment for the PR

## Scope Discipline

Marketplace tables (campaigns, offers, negotiations, affiliate, payments, etc.) exist but features are intentionally unbuilt. Do not implement them, do not modify their deny-by-default RLS state, and do not touch production data without an explicit task.

---

*This file is the single source of truth for agent behavior. Update it when architecture or rules change.*