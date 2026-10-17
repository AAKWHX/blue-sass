# Blue Sass footer signature

Portable source for React / Next.js, plus framework-independent HTML and CSS. No runtime dependencies beyond React. No tracking, requests to third parties, web fonts, or floating overlays. The link opens the official website only when clicked.

## React / Next.js

1. Copy `BlueSassSignature.tsx` and `blue-sass-signature.module.css` into the same component directory.
2. Copy `blue-sass-mark.svg` into your public assets directory.
3. Import the component and render it inside your existing footer:

```tsx
import { BlueSassSignature } from "./BlueSassSignature";

<footer>
  <BlueSassSignature variant="dark" size="ultra-compact" logoSrc="/assets/blue-sass-mark.svg" />
</footer>
```

Your bundler must support TypeScript, React JSX and CSS modules. The website integration is in `components/site-footer.tsx`. Source is intentionally distributed without a separate build or registry publication.

## Props

| Prop | Values / default |
| --- | --- |
| variant | `dark` (dark host background), `light` (light host background) |
| size | `compact` (default), `ultra-compact` |
| tagline | Optional string shown on a second line; omit for the smallest footer |
| logoSrc | Local asset path; default `/blue-sass-mark.svg` |
| label | Accessible link label; override to localize for the host project |

```tsx
<BlueSassSignature variant="light" tagline="Designed & Developed by Blue Sass" />
```

The primary wording is always **Crafted by Blue Sass**. The logo has empty alternative text because the link already has an accessible name. A 44px minimum interactive area supports touch without a banner. Reduced-motion preferences disable the hover movement. The English wordmark uses LTR direction inside either RTL or LTR footers.

## Plain HTML / CMS sites

Copy `blue-sass-signature.css` and `blue-sass-mark.svg` into `/assets/`, then insert the fragment in `signature.html` into your footer. Set `data-theme="light"` for a light background and `data-size="ultra-compact"` for the smallest mark. Add `<small>Your optional tagline</small>` inside the text span if needed. No JavaScript is required.

CSS uses a dedicated class and data attributes to avoid host selectors. As with any embed, very broad host `!important` rules can override it; preview on the destination site.

## Logo provenance

The SVG reproduces the existing repository `components/brand-logo.tsx` geometry, gradient, and colors exactly. It is an extraction of existing artwork, not a newly designed logo. External brand approval and client reuse rights were not independently verified. Keep the asset unchanged unless Blue Sass supplies an approved replacement.

## Validation

Preview light/dark hosts, keyboard focus, narrow screens and your footer's actual fonts. Check that the link opens https://www.bluesass.nl with `noopener noreferrer`. This source package has not been published to npm or deployed to client websites.

## Visual examples

Open `preview.html` from a local static server to compare light/dark backgrounds, both sizes, an optional tagline and an RTL host footer. It loads only local assets.
