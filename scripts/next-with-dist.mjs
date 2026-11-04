// QA-only entry point lock by default; explicit production release execution requires BLUE_SASS_PRODUCTION_RELEASE="approved" outside QA_PUBLIC_ONLY.
import { spawnSync } from "node:child_process";

const mode = process.argv[2];
const isApprovedProductionRelease =
  process.env.BLUE_SASS_PRODUCTION_RELEASE === "approved" &&
  process.env.QA_PUBLIC_ONLY !== "1" &&
  process.env.BLUE_SASS_R22_PREVIEW !== "1" &&
  (mode === "build" || mode === "start");

if (!isApprovedProductionRelease) {
  throw new Error("QA_ENTRY_POINT_NOT_APPROVED_L2_B1");
}

const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", mode, ...(mode === "build" ? ["--webpack"] : [])],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      BUILD_DIST: "1",
      NEXT_TELEMETRY_DISABLED: "1",
      QA_PUBLIC_ONLY: "0",
      BLUE_SASS_R22_PREVIEW: "0",
      NEXT_PUBLIC_ADSENSE_ENABLED: process.env.NEXT_PUBLIC_ADSENSE_ENABLED ?? "false",
      STRIPE_PAYMENTS_ENABLED: "false",
    },
  },
);
process.exit(result.status ?? 1);
