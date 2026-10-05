import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextCoreWebVitals,
  globalIgnores([
    ".next/**",
    ".next-build/**",
    "out/**",
    "build/**",
    "downloads/**",
    "next-env.d.ts",
    "**/* - kopie/**",
    "* - kopie.*",
  ]),

]);
