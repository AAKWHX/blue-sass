import path from "node:path";
import { fileURLToPath } from "node:url";
import { publicContentSecurityPolicy } from './lib/cmp-csp.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const publicPreview = process.env.BLUE_SASS_R22_PREVIEW === "1" && process.env.QA_PUBLIC_ONLY === "1";
const publicRelease = process.env.BLUE_SASS_PRODUCTION_RELEASE === "approved" && !publicPreview;
const nextConfig = {
  outputFileTracingRoot: dirname,
  ...(publicPreview ? { typescript: { tsconfigPath: "qa/public-preview-tsconfig.json" } } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "3200kb" }, ...(publicPreview || publicRelease ? { cpus: 1 } : {}) },
  images: { qualities: [75, 92] },
  // Resolve legacy service aliases before rendering/metadata streaming.
  redirects() {
    const locale = ":locale(ar|en|nl|de|tr|fr|es|it|pt|pl|uk|ru|zh|ja|ko)";
    const retired = ["pricing"].map(path => ({ source: `/${locale}/${path}`, destination: "/:locale/services", permanent: true }));
    return [{ source: "/:locale(de|tr|fr|es|it|pt|pl|uk|ru|zh|ja|ko)/:path*", destination: "/en/:path*", permanent: true }, ...retired, ...Object.entries({ mobile: "android", cloud: "erp", security: "web" }).map(([alias, service]) => ({
      source: `/${locale}/services/${alias}`,
      destination: `/:locale/services/${service}`,
      permanent: true,
    }))];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        ...(publicPreview ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
        ...(publicPreview ? [{ key: "X-Blue-Sass-QA", value: "public-only-db-locked" }] : []),
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        ...(!publicPreview ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
        { key: "Content-Security-Policy", value: publicPreview ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:3199; media-src 'self' blob:; frame-src 'none'; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'" : publicContentSecurityPolicy() },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }, {
      // These are public font/media files. Opaque-origin sandbox previews need
      // anonymous CORS font loads; session and API responses remain private.
      source: "/_next/static/media/:path*",
      headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
    }, {
      source: "/fonts/ibm-plex-sans-arabic/:path*",
      headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
    }, ...(!publicPreview ? [{ source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }, { source: "/:locale(ar|en|nl)/(admin|portal|login|register|forgot-password|verify|staff|quote|create-project)/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] : [])];
  },

  /**
   * The sandbox preview is proxied from https://{port}-{sandboxId}.e2b.app,
   * so the dev server must accept that origin for /_next/* requests.
   */
  allowedDevOrigins: ["127.0.0.1", "localhost"],

  /**
   * `next build` and `next dev` must never share a .next directory: a build
   * run while the dev server is live overwrites its chunks and the dev server
   * then dies with "__webpack_modules__[moduleId] is not a function".
   * Builds are redirected to .next-build via BUILD_DIST=1 (see package.json).
   */
distDir: publicPreview ? ".next-r22-email" : publicRelease && !process.env.VERCEL ? ".next-public-release" : process.env.BUILD_DIST && !process.env.VERCEL ? ".next-build" : ".next",
  turbopack: {
    resolveAlias: {
      "@/*": "./*",
    },
  },

  /**
   * Kept for the webpack path (`next build --webpack`). The `@/*` alias in
   * tsconfig.json alone is not enough in this project — without this the
   * build fails with "Can't resolve '@/components/...'".
   */
  webpack(config) {
    config.resolve.alias = { ...(config.resolve.alias || {}), "@": dirname };
    return config;
  },
};

export default nextConfig;
