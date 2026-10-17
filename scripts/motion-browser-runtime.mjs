import { createRequire } from 'node:module';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

/** QA-only runtime: use the bundled Playwright and the already-installed FFmpeg CLI. */
export async function motionChromium() {
  const cache=path.resolve('tmp/motion-browser-cache');
  await mkdir(path.join(cache,'ffmpeg-1011'),{recursive:true});
  // This Playwright build expects revision 1011; the installed 1013 CLI accepts its recording flags.
  await copyFile(path.join(process.env.LOCALAPPDATA,'ms-playwright/ffmpeg-1013/ffmpeg-win64.exe'),path.join(cache,'ffmpeg-1011/ffmpeg-win64.exe'));
  process.env.PLAYWRIGHT_BROWSERS_PATH=cache;
  const require=createRequire(import.meta.url);
  return require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core')).chromium;
}
