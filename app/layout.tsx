import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bluesass.nl"),
  applicationName: "Blue Sass | بلو ساس",
  title: {
    default: "Blue Sass | بلو ساس — مواقع وتطبيقات ومنتجات رقمية",
    template: "%s | Blue Sass",
  },
  description:
    "بلو ساس تصمّم وتطوّر المواقع والتطبيقات والأنظمة الذكية والمنتجات الرقمية من الفكرة حتى الإطلاق.",
  keywords: [
    "Blue Sass",
    "بلو ساس",
    "بلو ساس هولندا",
    "تصميم مواقع",
    "تطوير تطبيقات",
    "شركة برمجيات",
    "software agency",
    "web development",
    "mobile apps",
    "AI automation",
  ],
  authors: [{ name: "Blue Sass", url: "https://www.bluesass.nl" }],
  creator: "Blue Sass",
  publisher: "Blue Sass",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/icon.png",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  category: "technology",
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
