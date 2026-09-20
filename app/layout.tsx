import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bluesass.nl"),
  title: "Blue Sass — Digital products built clearly",
  description:
    "Blue Sass designs and builds websites, apps, intelligent systems and digital brands.",
  keywords: ["Blue Sass", "software agency", "web development", "mobile apps", "AI automation"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#05070E",
  colorScheme: "dark",
};

/**
 * Pass-through root.
 *
 * The real <html> element is rendered by app/[locale]/layout.tsx, which knows
 * the locale from its route params. Resolving it here instead would require
 * headers(), which opts every route into dynamic rendering and destroys
 * static generation — while rendering it in the locale layout keeps BOTH
 * server-correct lang/dir and 29 prerendered pages.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
