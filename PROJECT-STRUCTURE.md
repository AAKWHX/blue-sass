# AWWA Platform — Project Structure Reference

> Reference sheet for writing frontend prompts. Describes the project **as it
> actually is** at commit `9f76283`, not as planned.
> Repo: `github.com/omaramen354-dev/xowaak` · branch `arena/01a071a0-xowaak`
> 62 tracked files · ~6,900 lines of TS/TSX/CSS/SQL.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.3.4**, App Router | Server Components by default |
| Language | **TypeScript 5.9** | do not upgrade to 7.x — Next rejects it |
| Styling | **Tailwind CSS 4.3** | `darkMode: "class"`, dark-only in practice |
| Animation | **Framer Motion 13** | reveals, stagger, counters, tilt |
| 3D | **three 0.185** + **@react-three/fiber 9** + **drei 10** | both canvases dynamically imported |
| Backend | **Supabase** (`@supabase/ssr`) | runs on mock data with no credentials |
| Icons | **lucide-react** | `Github`/`Linkedin`/`Twitter` do NOT exist in this version |
| Fonts | `@fontsource-variable/cairo` + `jetbrains-mono` + `geist` | self-hosted; Google Fonts is unreachable |

**No** state library, form library, component kit (no shadcn/MUI), test runner or
Storybook. Everything is hand-rolled.

---

## 2. Directory tree

```
xowaak/
├── app/
│   ├── layout.tsx              pass-through root (metadata + viewport only)
│   ├── globals.css             622 lines — design system lives here
│   ├── not-found.tsx
│   └── [locale]/
│       ├── layout.tsx          owns <html lang/dir>, chrome, Providers, header/footer
│       ├── page.tsx            Hero → Services → Portfolio → Process → CallToAction
│       ├── quote/page.tsx      QuoteWizard
│       ├── portal/page.tsx     PortalView
│       └── admin/page.tsx      AdminView
│
├── components/
│   ├── providers.tsx           I18nContext + useI18n() + ContentProvider
│   ├── site-header.tsx         nav, language + theme switchers
│   ├── site-footer.tsx
│   ├── public/
│   │   ├── hero.tsx            two-column layout, the layering contract
│   │   ├── hero-orb.tsx        WebGL centrepiece (312 ln) — black body, fresnel neon rim
│   │   ├── hero-console.tsx    tilted holographic console
│   │   ├── services.tsx
│   │   ├── portfolio.tsx       filtering + public/private tags + modal
│   │   ├── process.tsx         exports Process AND CallToAction
│   │   └── quote-wizard.tsx    multi-step + live cost estimate
│   ├── portal/portal-view.tsx  423 ln — progress, files, feedback
│   ├── admin/
│   │   ├── admin-view.tsx      366 ln — role-aware ERP shell
│   │   ├── cms-portfolio.tsx   305 ln — edits the public portfolio
│   │   └── cms-stats.tsx       edits the hero stats
│   └── ui/
│       ├── motion.tsx          Reveal, StaggerGroup/Item, AnimatedCounter, TiltCard, Spotlight, Pressable
│       ├── primitives.tsx      SectionHeading, ProgressBar, Card, StatusBadge
│       ├── aurora.tsx          Aurora (CSS ambient light + RGB halos), BeamDivider
│       ├── backgrounds.tsx     ParticleField (used only by process.tsx)
│       ├── scene-3d.tsx        335 ln — global fixed WebGL field
│       ├── scene-mount.tsx     gates scene-3d behind capability checks
│       └── switchers.tsx       LanguageSwitcher
│
├── hooks/
│   ├── use-media-query.ts
│   └── use-projects.ts
│
├── lib/
│   ├── i18n/
│   │   ├── config.ts           locales, defaultLocale, localeMeta, isLocale, getDir
│   │   ├── index.ts            dictionaries map, getDictionary
│   │   └── dictionaries/       ar de en es fr nl tr  (en.ts defines the Dictionary type)
│   ├── supabase/
│   │   ├── config.ts           URL/key + isSupabaseConfigured
│   │   ├── client.ts           browser client
│   │   ├── server.ts           server client
│   │   └── types.ts            all DB types + AppRole etc.
│   ├── content-store.tsx       CMS ↔ public site bridge (React context)
│   ├── mock-data.ts            224 ln — profiles, projects, milestones, files, feedback, tasks…
│   ├── pricing.ts              quote calculator
│   ├── permissions.ts          module ↔ role matrix, mirrors RLS
│   ├── neon-cycle.ts           shared neon colour cycle used by BOTH 3D scenes
│   └── fonts.ts
│
├── supabase/schema.sql         487 ln — tables, enums, RLS policies
├── proxy.ts                    locale redirect (Next 16 renamed middleware -> proxy)
├── next.config.mjs             webpack alias + BUILD_DIST distDir switch
├── tailwind.config.ts          design tokens
├── AGENTS.md                   ← rules for AI agents; READ THIS
└── PROJECT-STRUCTURE.md        this file
```

---

## 3. Design system (`tailwind.config.ts` + `globals.css`)

### Colour tokens
```
base      #050608     page background
elevated  #0A0B0E     raised sections
surface   #101216     cards
line      #232630     hairline borders
line-strong #383D47

Monochrome white-neon (names keep their old roles):
neon.cyan/magenta #FFFFFF   neon.sky #E8ECF0   neon.blue/pink #DDE2E8
neon.indigo/purple #AEB6BF  neon.emerald #6FE39C (status only)

ink.hi    #FFFFFF   21:1     headings
ink.mid   #CBD5E1   14.3:1   body
ink.low   #94A3B8   8.9:1    secondary
ink.faint #64748B   4.9:1    meta
```

### Z-index scale — **use these tokens, never `z-[…]`**
| Token | Value | Purpose |
|---|---|---|
| `z-backdrop` | 0 | mesh, grid, aurora, 3D field — always `pointer-events-none` |
| `z-stage` | 20 | hero visual column (orb + console) |
| `z-content` | 20 | page wrapper above the fixed canvas |
| `z-copy` | 30 | hero text, badge, CTAs |
| `z-overlay` | 60 | modals |

### Component classes (in `globals.css`)
`container-x` `section-y` `surface` `glass-card` `glow-hover` `glow-border`
`btn` `btn-primary` `btn-ghost` `chip` `field`
`cyber-grid` `mesh-deep` `aurora` `rgb-halo` `halo-r/g/b/v` `rgb-wash`
`starfield` `beam-sweep` `console-tilt` `console-shell` `console-row`
`live-dot` `counter-live` `text-gradient` `text-gradient-hero` `mono-label`
`neon-border` `noise` `flip-x` `origin-inline-start`

### Animations
Config: `float fade-up shimmer drift-a drift-b pulse-glow spin-slow float-y
icon-pulse gradient-pan bob blink-soft scan-y bar-idle`
Raw CSS: `gradient-pan rotate-angle sweep ping-soft counter-breathe wash-spin
beam-fall star-drift grid-crawl grid-hue grid-bloom aurora-breathe hero-halo
ring-spin-a ring-spin-b ring-spin-c spark-orbit`

---

## 4. i18n

7 locales: **ar** (RTL), en, nl, de, tr, fr, es. Default `en`.

- `en.ts` is the source of truth: `export type Dictionary = typeof en`.
  Adding a key to `en.ts` makes it **required in all six others** — TS enforces it.
- Top-level keys: `brand nav common hero services portfolio process quote
  portal admin status footer`
- Routing: `/[locale]/…`; middleware redirects `/` using cookie → `accept-language` → `en`.
- `<html lang dir>` is resolved **server-side** in `app/layout.tsx` from the
  `x-pathname` header set by the middleware.
- Arabic overrides in `globals.css`: Cairo font, line-height 1.3–1.95,
  `letter-spacing: 0`, weights stepped down (black→800, extrabold→700).

---

## 5. Data model (`supabase/schema.sql`)

**Enums**
```
app_role          super_admin | admin | pm | employee | client
project_stage     planning | design | development | testing | review | completed
milestone_status  todo | in_progress | blocked | done
file_category     design | document | contract | source | invoice
feedback_category design | content | bug | scope
project_visibility public | private
```

**Tables**
`profiles` `user_roles` `projects` `project_members` `project_milestones`
`project_files` `feedback` `messages` `quote_requests`

RLS policies exist per table (`projects_scoped_read`, `files_read`,
`milestones_write`, …) isolating client data and granting per-role access.
`lib/permissions.ts` mirrors this matrix on the client.

---

## 6. The three systems

**Public** — Hero (orb + console + counters + pipeline), Services, Portfolio
(filter, public/private tags, modal), Process, CTA, Quote wizard with live
pricing (`lib/pricing.ts`: 6 project types × 8 features × 3 speeds, EUR).

**Client Portal** — 5-stage progress bar with %, file delivery by category,
feedback/revision feed.

**Admin / ERP** — role-aware modules gated by `canAccess(role, module)`:
`dashboard projects tasks team clients cmsStats cmsPortfolio`.
The CMS writes through `lib/content-store.tsx` and the public site re-renders.

---

## 7. Hard rules (full list in `AGENTS.md`)

1. **Keep the webpack alias** in `next.config.mjs`. `@/*` in `tsconfig.json`
   alone does not work here — the build fails with "Can't resolve '@/components/…'".
2. **TypeScript stays on 5.x.**
3. **Never `next/font/google`** — no network access to fonts.
4. **Never run `next build` while `next dev` is running** on the same distDir.
   Already prevented by `BUILD_DIST=1 → .next-build`.
5. **Custom `z-*` utilities belong in `theme.extend.zIndex`**, not
   `@layer utilities` — they silently fail to emit there.
6. **Keyframes used only from raw CSS must be written in `globals.css`.**
   Tailwind only emits config keyframes for `animate-*` classes it scans.
7. **Restart the dev server after editing `tailwind.config.ts`** (config is cached).
8. **Verify `lucide-react` icon names exist** before importing.
9. Custom properties animated in keyframes need `@property` or they jump
   between values instead of crossfading.

---

## 8. Commands

```bash
npm install
npm run dev      # 0.0.0.0:3000 → .next
npm run build    # BUILD_DIST=1 → .next-build (safe while dev runs)
npm start
npx tsc --noEmit # type check
```

Env is optional — `.env.example` → `.env.local` with
`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

## 9. Performance budget — do not regress

- **Zero WebGL.** The ogl-based scenes (`hero-core-gl`, `aurora-gl`,
  `molten-metal`) and the console rig are gone from the bundle; `ogl` is no
  longer a dependency. The hero centrepiece is `hero-visual.tsx` — a pure-CSS
  light stage (`.css-energy-core`, `.hero-ring-*`, `.hero-spark-*`) that only
  animates transform/opacity on the compositor. The page backdrop is
  `aurora-backdrop.tsx` (`.aurora-field`, `.starfield`, three blurred orbs).
- **Never animate `filter: blur()` or `background-position`.** Both force a
  full repaint every frame — the exact failure mode that made the old shaders
  laggy. Reveals (`fadeUp`), the services stage transition and `pulse-glow`
  animate transform + opacity only. Blurs are applied as static classes.
- `ParticleField` (canvas) runs an O(n²) constellation pass — capped at 45
  particles, pauses off-screen, dies for reduced-motion.
- First Load JS shared by all: ~103 kB (three.js never shipped anyway).
- 29+ static pages prerender.

---

## 10. Writing a frontend prompt against this

Useful to state explicitly:

- Which **route** (`app/[locale]/…`) and which **component file**.
- That new UI strings go in **all seven** dictionaries, starting with `en.ts`.
- Which **z-token** the new layer belongs to.
- Whether the work is **RTL-sensitive** — prefer logical utilities
  (`ms-/me-`, `start-/end-`, `text-start`) over `ml-/mr-/left/right`.
- That the **103 kB** budget and the 9 hard rules above must hold.
- That verification cannot use a browser in the sandbox: check rendered HTML
  and grep the compiled CSS, because classes/keyframes can fail silently.
