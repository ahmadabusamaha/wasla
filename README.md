# Wasla | وصلة

> **رابطك. تأثيرك. فرصك.** — Your Link. Your Influence. Your Opportunities.

منصة SaaS تربط صنّاع المحتوى والمشاهير بالشركات والعلامات التجارية. الصانع يحصل على صفحة عامة أنيقة على `wasla.com/username` تجمع روابطه وحساباتاته وعروضه، والشركات تكتشف المشاهير وترسل عروض التعاون وتدير حملاتها.

## Stack

- **Next.js 16** (App Router, TypeScript strict, Turbopack)
- **Tailwind CSS v4 + shadcn/ui**
- **Supabase** — PostgreSQL + Auth + Storage + Row Level Security
- **Zod + React Hook Form**
- **Vercel** — production hosting (GitHub → Vercel auto-deploy)

## Development

```bash
npm install
cp .env.example .env.local   # then fill the values from your Supabase dashboard
npm run dev                  # http://localhost:3000
```

Other commands:

```bash
npm run lint      # eslint
npm run build     # production build
npm run db:push   # apply supabase/migrations to the linked Supabase project
```

## Environment Variables

Create `.env.local` (never committed) with:

```env
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Values come from your Supabase dashboard → Project Settings → API. The same variables must exist in Vercel for Production/Preview/Development environments.

## Supabase

The app talks to Supabase directly (no separate backend): Auth (email/password + optional OAuth), PostgreSQL behind RLS policies, and Storage buckets (`avatars`, `logos`, `images` public; `media-kit`, `campaign-files` private).

Link a project once: `npx supabase login` then `npx supabase link --project-ref <ref>`.

## Database

All schema lives in `supabase/migrations/*.sql` — applied in order via `supabase db push`. Never edit applied migrations; add new ones. `supabase/seed.sql` contains fictional demo data (creators: أحمد، ليان، سارة، كريم) and is safe/idempotent.

## Deployment

```
git push origin main  →  GitHub  →  Vercel builds & deploys automatically
```

Vercel project `wasla` is connected to this repository; required environment variables are configured in the Vercel project settings.

## Development from any device

Open the repo on GitHub → **Code → Codespaces → Create codespace**. The included `.devcontainer/` sets up Node.js, Git, Supabase CLI, and OpenCode automatically. Then:

```bash
cp .env.example .env.local   # fill values (kept out of git)
npm run dev
```

## OpenCode

Run OpenCode inside the project (Codespaces or any machine):

```bash
opencode
```

Project conventions for agents live in [AGENTS.md](AGENTS.md) — architecture rules, database/RLS policy, RTL requirements, and commit discipline.
