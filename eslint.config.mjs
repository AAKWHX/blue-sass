import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextCoreWebVitals,
  globalIgnores([
    ".next-*/**",
    ".playwright-mcp/**",
    ".next/**",
    ".next-build/**",
    ".next-r22-preview/**",
    ".next-r22-release/**",
    ".next-r22-phase3/**",
    ".next-r22-email/**",
    "qa/**",
    "dependency-remediation-evidence/**",
    "**/*.d.mts",
    "out/**",
    "build/**",
    "downloads/**",
    "next-env.d.ts",
    "**/* - kopie/**",
    "* - kopie.*",
    "tmp/**",
    "artifacts/**",
  ]),

]);
