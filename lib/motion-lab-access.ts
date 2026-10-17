import 'server-only';
import { headers } from 'next/headers';

/** No persisted setting: an explicit process flag can enable QA on loopback only. */
export async function motionLabAllowed() {
  if (process.env.NODE_ENV === 'development') return true;
  if (process.env.BLUE_SASS_MOTION_LAB !== 'local-preview') return false;
  const host = (await headers()).get('host') || '';
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}
