import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@/app/fonts/ibm-plex-sans-arabic.css";

export const arabicFont = { variable: "font-ibm-plex-arabic" };

/**
 * Typography stack.
 *
 * - Geist Sans  → Latin UI text (loaded locally by the `geist` package)
 * - Geist Mono  → fallback monospace
 * - IBM Plex Sans Arabic → Arabic UI text (Arabic routes only)
 * - JetBrains Mono Variable → numerals, code, mono labels
 *
 * IBM Plex uses existing, licensed local WOFF2 subsets and font-display: swap.
 * Unicode ranges preserve on-demand subset loading without network font builds.
 * JetBrains Mono is self-hosted through @fontsource-variable.
 */
export const fontVariables = [GeistSans.variable, GeistMono.variable].join(" ");
