# Blue Sass — gold motion release

This release includes the reviewed local cinematic redesign, Arabic/English/Dutch public pages, discovery and comparison directories, service-template previews, a CSS 3D infinity sculpture with gesture-only audio, and responsive scroll interactions.

Two Higgsfield assets were generated for the hero background:

- Image job `1c3ced3a-defe-492e-95aa-7500f39f3e25`, GPT Image 2.5, 16:9. Optimized poster: `public/media/higgsfield/ambient-gold-v2.webp`.
- Video job `6b4be5bb-f4fe-40a9-a66f-50e6b8d23099`, Wan 2.6, 5 seconds, 1080p. Optimized silent H.264: `public/media/higgsfield/ambient-gold-v2.mp4`.

The observed account balance changed from 76.5 to 66.25 credits: **10.25 credits spent**, within the authorized 30-credit cap. No extra generation or credit purchase was performed. The interactive sculpture is still code-based, not replaced by generated media.

Video respects reduced motion, visibility, pause and data-saving preferences. The high-resolution poster remains the fallback. No new external media requests are required at runtime.

Release preparation uses an isolated clone under `tmp/gold-release-source`. Only selected source/configuration directories are overlaid; existing tracked source removals are applied there. Private environment files, local backup copies, browser artifacts, node_modules and local build output are excluded. The original dirty working checkout is preserved. The production base before this release was commit `44be128fcc99f28e7aca77469b474925534a7e52`, deployment `dpl_9JxvgeUM48853gbGeJNRmjcG8egV`.

Security validation includes 18 passing boundary/password/table/network tests and an npm runtime-dependency audit with zero known vulnerabilities on 2026-10-17. Public/static asset secret scanning found no matching patterns; production secrets were not downloaded or printed. These checks do not constitute a comprehensive penetration test. No database migrations, payment setup, secret changes or DNS changes are part of this release.
