import { spawnSync } from "node:child_process";

const command = process.argv[2];
if (!command || !["build", "start"].includes(command)) {
  throw new Error("Usage: node scripts/next-with-dist.mjs <build|start>");
}

const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", command, ...process.argv.slice(3)], {
  stdio: "inherit",
  env: { ...process.env, BUILD_DIST: "1" },
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
