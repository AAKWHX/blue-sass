import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { IBM_Plex_Sans_Arabic } from "next/font/google";

export const arabicFont = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
  preload: false,
  variable: "--font-ibm-plex-arabic",
});

/**
 * Typography stack.
 *
 * - Geist Sans  → Latin UI text (loaded locally by the `geist` package)
 * - Geist Mono  → fallback monospace
 * - IBM Plex Sans Arabic → Arabic UI text (Arabic routes only)
 * - JetBrains Mono Variable → numerals, code, mono labels
 *
 * Next downloads IBM Plex at build time and serves it from the site itself.
 * JetBrains Mono is self-hosted through @fontsource-variable.
 */
export const fontVariables = [GeistSans.variable, GeistMono.variable].join(" ");
