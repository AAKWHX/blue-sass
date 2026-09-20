# AWWA Platform — Agent Briefing

Read this before editing. It records constraints discovered the hard way.

## Stack

Next.js 16.3.4 (App Router) · TypeScript 5.9 · Tailwind CSS 4 · Framer Motion
Supabase-ready (runs on mock data without any credentials).

## Commands

```bash
npm install
npm run dev      # 0.0.0.0:3000, builds into .next
npm run build    # BUILD_DIST=1 -> builds into .next-build
npm start        # BUILD_DIST=1
```

## HARD RULES — violating these breaks the app

### 1. Never remove the webpack alias in `next.config.mjs`

The `@/*` alias in `tsconfig.json` alone does **not** work in this setup;
`next build` fails with `Module not found: Can't resolve '@/components/...'`.
The working fix is the explicit alias in the webpack hook plus `turbopack.resolveAlias`.
Adding `baseUrl` or deleting `.next` does not substitute for it.

### 2. Do not upgrade TypeScript past 5.x

`typescript@7.x` was rejected by Next; stay on 5.9.x.

### 2b. Tailwind v4 specifics

- `globals.css` uses `@import "tailwindcss"` plus `@config "../tailwind.config.ts"`.
  The JS config stays the single source of truth for colours, the z-scale and
  keyframes — do not duplicate them into `@theme`.
- **`@apply` can no longer reference another custom component class.**
  `@apply btn ...` fails with "Cannot apply unknown utility class `btn`";
  repeat the base declarations instead.
- PostCSS uses `@tailwindcss/postcss`; autoprefixer is built in.

### 2d. shadcn/ui

Components live in `components/ui/` (button, card, input, textarea, label,
badge, separator, dialog, progress, select) and are wired to the AWWA palette
via the `@theme inline` block in `globals.css` — do NOT re-run
`npx shadcn init`, it would overwrite that file.

- Native `<button>/<input>/<textarea>/<select>` are no longer used anywhere.
- Buttons that carry their own complete styling (filter chips, selectable
  cards) use `variant="unstyled" size="auto"`.
- `.btn-primary` / `.btn-ghost` are reachable as `variant="neon"` /
  `variant="ghostNeon"`.
- Wrap links with `<Button asChild variant=...><Link/></Button>`; passing
  `variant` straight to `<Link>` is a type error.
- `cn()` from `@/lib/utils` uses tailwind-merge, so **conflicting utilities
  are dropped, last one wins**. Adding `relative` next to `sticky` silently
  removed `sticky` from the header — check the rendered class list after
  editing shared className strings.

### 2e. ESLint stays on 9.x

`eslint@10` breaks `eslint-config-next@16`
("contextOrFilename.getFilename is not a function") and linting fails
outright. Do not upgrade until Next ships support.

### 2c. Next 16 specifics

- `middleware.ts` is now **`proxy.ts`** with a `default` export named `proxy`.
- `<html>` is rendered by `app/[locale]/layout.tsx`, NOT the root layout.
  Resolving the locale in the root would need `headers()`, which forces every
  route dynamic and loses all 29 prerendered pages. Do not move it back.
- React Compiler lint rules are active. `react-hooks/purity` and
  `react-hooks/immutability` are disabled **only** for the two WebGL scenes
  (see `eslint.config.mjs`) because `useFrame` runs outside React render.

### 3. Never use `next/font/google`

Google Fonts was unreachable during development. Fonts are self-hosted via
`@fontsource-variable/*` CSS imports. Keep it that way — it also removes a runtime
dependency on an external host.

### 4. `dev` and `build` must not share a `distDir`

Running `next build` while `next dev` is live overwrites the chunks the dev server
is serving, producing:
- `TypeError: __webpack_modules__[moduleId] is not a function`
- `Cannot find module './vendor-chunks/*.js'`

This is **not** a stale cache — do not "fix" it by deleting `.next` and moving on.
It is already prevented structurally by the `BUILD_DIST` switch. Keep that switch.

### 5. Custom `z-*` utilities must live in `tailwind.config.ts`

Declaring `.z-backdrop` etc. in `@layer utilities` **silently emits nothing** —
the names collide with Tailwind's built-in `z-` namespace. They belong in
`theme.extend.zIndex`.

### 6. Keyframes referenced only from raw CSS must be written in `globals.css`

Tailwind only emits config `keyframes` when a matching `animate-*` class appears
in scanned content. `gradient-pan` is used inside `.text-gradient` in raw CSS,
so its `@keyframes` is declared directly in `globals.css`. Do not move it.

### 7. Restart the dev server after editing `tailwind.config.ts`

The config is cached; otherwise every route 500s with "class does not exist".

### 8. Verify icon names before importing from `lucide-react`

The installed version does **not** export `Github`, `Linkedin`, or `Twitter`.

### 9. `origin-start` is not a Tailwind class

Use the custom `.origin-inline-start` utility.

### 10. No WebGL — the site is CSS-composited by design

The ogl shader rigs (`hero-core-gl`, `aurora-gl`, `molten-metal`) were removed:
three full-screen shader loops made the site laggy on phones. Do not reintroduce
them or add three.js/ogl/R3F. The hero centrepiece is `components/public/hero-visual.tsx`
(pure CSS, GPU-composited) and the backdrop is `components/ui/aurora-backdrop.tsx`.
When adding animation, animate **transform/opacity only** — never `filter: blur()`
or `background-position` (both repaint every frame). Blur is a static class.

## Layering contract

Enforced through `theme.extend.zIndex`. Never use `z-[…]` arbitrary literals.

| Token | Value | Use |
|---|---|---|
| `z-backdrop` | 0 | mesh, cyber-grid, aurora orbs — always `pointer-events-none` |
| `z-stage` | 10 | the 3D canvas only |
| `z-content` | 20 | all copy, stats, CTAs |
| `z-overlay` | 60 | modals |

The hero avoids text/3D overlap **structurally**, not by tuning: it is a two-column
grid `lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]` with the canvas `absolute inset-0`
scoped to its own grid cell. Do not collapse this back to a single stacking context.

## Palette

Monochrome since the white-neon pass: `neon-cyan #FFFFFF` · `neon-sky #E8ECF0` ·
`neon-blue #DDE2E8` · `neon-indigo #AEB6BF` · `neon-purple #AEB6BF` ·
`neon-magenta #FFFFFF` · `neon-emerald #6FE39C` (status green only)
Base `#050608` · surface `#101216` · line `#232630`
The token NAMES keep their old roles — never introduce new RGB accents.

## i18n

7 locales in `lib/i18n/`: `ar` (full RTL), `en`, `nl`, `de`, `tr`, `fr`, `es`.
Arabic has dedicated typography overrides (looser line-height, zero letter-spacing,
stepped-down weights). When adding UI copy, add the key to **all seven** locale files.

## Structure

```
app/[locale]/          home, quote, portal, admin
components/public/     hero + hero3d, services, portfolio, process
components/portal/     client portal
components/admin/      ERP dashboard + CMS
components/ui/         motion, aurora, primitives
lib/i18n/              7 locales
lib/supabase/          client.ts, server.ts, types.ts
lib/content-store.tsx  central store wiring CMS -> public site
supabase/schema.sql    tables + RLS policies
```

## Verification

Playwright browser downloads are blocked in some sandboxes. When you cannot use a
browser, verify by curling rendered HTML and grepping the compiled CSS for the
classes/keyframes you expect — silent non-emission is a real failure mode here
(see rules 5 and 6).

Do not leave placeholder comments such as `// سنكمل لاحقاً` in core sections.
