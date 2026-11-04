import { spawnSync } from 'node:child_process';

const mode = process.argv[2];
if (process.argv.length !== 3 || !['build', 'start'].includes(mode)) throw new Error('PUBLIC_RELEASE_COMMAND_REJECTED');
if (process.env.QA_PUBLIC_ONLY === '1' || process.env.BLUE_SASS_R22_PREVIEW === '1') throw new Error('PUBLIC_RELEASE_QA_CONFLICT');
const [major, minor, patch] = process.versions.node.split('.').map(Number);
if (major !== 24 || minor < 22 || (minor === 22 && patch < 1)) throw new Error('PATCHED_NODE_24_REQUIRED');

// Explicit public-only subprocess: never inherit DB, auth, payment, mail or hosting credentials.
const allowed = ['SystemRoot', 'WINDIR', 'ComSpec', 'PATH', 'TEMP', 'TMP', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'CI', 'VERCEL', 'VERCEL_ENV', 'VERCEL_URL', 'VERCEL_PROJECT_PRODUCTION_URL'];
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => allowed.some(k => k.toLowerCase() === key.toLowerCase())));
Object.assign(env, {
  NODE_ENV: 'production', BUILD_DIST: '1', BLUE_SASS_PRODUCTION_RELEASE: 'approved',
  NEXT_PUBLIC_SITE_URL: 'https://www.bluesass.nl', NEXT_PUBLIC_ADSENSE_ENABLED: 'false',
  STRIPE_PAYMENTS_ENABLED: 'false', NEXT_TELEMETRY_DISABLED: '1',
});
const args = ['node_modules/next/dist/bin/next', mode, ...(mode === 'build' ? ['--webpack'] : ['--hostname', '127.0.0.1', '--port', '3204'])];
const result = spawnSync(process.execPath, args, { stdio: 'inherit', env, windowsHide: true });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
