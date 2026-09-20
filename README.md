# AWWA — AAKWHX Platform

Production-ready multilingual delivery platform for the AAKWHX technology agency,
built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** and **Supabase**.

## Systems

| System | Route | Description |
| --- | --- | --- |
| Public platform | `/{locale}` | Cinematic hero, services, filterable portfolio (public/private projects), process, testimonials |
| Quote estimator | `/{locale}/quote` | Interactive scope builder with live budget + timeline calculation |
| Client portal | `/{locale}/portal` | Stage tracker (Planning → Design → Development → Testing → Review), secure file delivery, feedback feed, messages |
| Admin / ERP | `/{locale}/admin` | Role-aware dashboard, project register, task kanban, team workload, client directory |

## Languages

`ar` (RTL) · `en` · `nl` · `de` · `tr` · `fr` · `es`

Locale is resolved by middleware from the `awwa-locale` cookie or `Accept-Language`,
then injected through `app/[locale]/layout.tsx`, which sets `dir` and `lang`.

## Roles

`super_admin`, `admin`, `pm`, `employee`, `client` — enforced in the UI by
`lib/permissions.ts` and in the database by the RLS policies in `supabase/schema.sql`.

## Design system — strict dark

Single-theme, high-contrast dark UI. There is no light mode and no `dark:` variant in the
codebase; every colour comes from a token in `tailwind.config.ts`.

| Token | Value | Use |
| --- | --- | --- |
| `base` | `#050608` | page background (deep monochrome black) |
| `surface` | `#101216` | cards, at 60% + `backdrop-blur-md` |
| `line` / `line-strong` | `#232630` / `#383D47` | hairline borders |
| `ink-hi` | `#FFFFFF` | headings, extrabold |
| `ink-mid` | `#CBD5E1` | body |
| `ink-low` | `#94A3B8` | secondary |
| `neon-cyan → neon-purple` | `#FFFFFF · #E8ECF0 · #DDE2E8 · #AEB6BF` | white neon: accents, gradients, glows |

Depth comes only from `.mesh-deep` (deep radial gradients living inside the black) and
`.cyber-grid` — never from silver or light-grey fills.

## Layering contract

Stacking is a named scale in `tailwind.config.ts` — never ad-hoc `z-[999]`:

| Token | z-index | Holds |
| --- | --- | --- |
| `z-backdrop` | 0 | aurora orbs, mesh, cyber grid |
| `z-stage` | 10 | the 3D canvas |
| `z-content` | 20 | all copy, stats, CTAs |
| `z-overlay` | 60 | modals |

The hero is a **two-column grid**: copy on one side, the 3D canvas in its own cell
(`absolute inset-0` scoped to that cell, not the section). Text and geometry occupy
separate grid tracks, so overlap is impossible by construction rather than by tuning.
`.text-plate` is available for any copy that must sit over live geometry.

## Ambient motion

Nothing is static after first paint:

- **Aurora orbs** drift and pulse continuously (`drift-a`, `drift-b`, `pulse-glow`).
- **Neon borders** (`.neon-border`) rotate a conic cyan→purple→magenta gradient via an
  animated `@property --angle`.
- **Icons** breathe with `animate-icon-pulse` / `animate-float-y`, staggered per card.
- **Text and CTA gradients** pan with `gradient-pan`; the primary button also sweeps a
  shimmer and presses to `scale: 0.98`.
- The **3D rig** keeps an idle sine-orbit so it moves even when the pointer is still.

## Arabic typography

Cairo Variable is visually heavier and taller than Geist, so RTL gets its own metrics:
`h1` 1.3, `h2` 1.35, `h3/h4` 1.45, body 1.95, letter-spacing reset to 0, and font
weights stepped down one notch (`black→800`, `extrabold→700`). Words can no longer
collide at display sizes.

## 3D hero

`components/public/hero-3d.tsx` — React Three Fiber scene loaded with
`dynamic(..., { ssr: false })`:

- wireframe icosahedron shell (cyan emissive)
- inner flat-shaded core with purple emissive material and a breathing pulse
- 900-point additive-blended holographic particle ring
- three inclined orbit lines

The whole rig eases toward the pointer (`MathUtils.lerp`) for a gyroscope-tilt feel.

## Dynamic CMS

Nothing on the marketing page is hardcoded. `lib/content-store.tsx` holds the stats and
showcase projects, persists to localStorage, and syncs across tabs. Two admin modules
write to it:

- **Stats & Records** (`/admin` → Stats) — edit value, prefix/suffix, decimals, growth %
  and label, with a live preview strip.
- **Portfolio CMS** (`/admin` → Portfolio) — create / edit / delete projects with title,
  description, preview URL, icon, cover gradient, category, tech stack, progress,
  featured flag and the Public/Private visibility tag.

Any change is reflected immediately on the public showcase and the hero counters.

## Structure

```
app/[locale]/          route group per language (home, quote, portal, admin)
components/            public/ (hero, hero-3d, services, portfolio, process, quote)
                       portal/, admin/ (incl. cms-stats, cms-portfolio)
                       ui/ (motion, backgrounds, primitives, switchers)
lib/i18n/              locale config + 7 typed dictionaries
lib/supabase/          client.ts, server.ts, config.ts (fallbacks), types.ts
lib/                   content-store.tsx, mock-data.ts, permissions.ts, pricing.ts, fonts.ts
hooks/                 use-projects.ts, use-media-query.ts
supabase/schema.sql    tables, enums, triggers, RLS, storage policies
```

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — the app runs with mock data without it
npm run dev                  # http://0.0.0.0:3000
npm run build                # builds into .next-build, safe to run while dev is up
```

> **Why two build directories?** `next dev` and `next build` both write to `.next` by
> default. Running a build while the dev server is live overwrites the chunks it is
> serving, and the dev server then crashes with
> `TypeError: __webpack_modules__[moduleId] is not a function` /
> `Cannot find module './vendor-chunks/*.js'`. `next.config.mjs` sends builds to
> `.next-build` via the `BUILD_DIST` env var so the two can never collide.

## Database

Apply `supabase/schema.sql` in the Supabase SQL editor. It creates
`profiles`, `user_roles`, `projects`, `project_members`, `project_milestones`,
`project_files`, `feedback`, `messages`, `quote_requests`, plus the
`project-files` private storage bucket and full row-level-security isolation
between clients.
