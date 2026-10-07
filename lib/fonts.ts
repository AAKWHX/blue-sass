import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

/**
 * Typography stack.
 *
 * - Geist Sans  → Latin UI text (loaded locally by the `geist` package)
 * - Geist Mono  → fallback monospace
 * - Noto Sans Arabic Variable → Arabic UI text
 * - JetBrains Mono Variable → numerals, code, mono labels
 *
 * Noto Sans Arabic and JetBrains Mono are self-hosted through @fontsource-variable
 * (imported in app/globals.css) so the app makes zero external font requests
 * and renders identically offline.
 */
export const fontVariables = [GeistSans.variable, GeistMono.variable].join(" ");
