export const INTRO_DURATION_MS = 2000;
export const SCULPTURE_DRAG_MS = 3000;
export const SCULPTURE_BREAK_MS = 650;
export const discoveryServices = ['web', 'android', 'ios', 'windows', 'store', 'erp', 'ai', 'design'] as const;
export type JourneyPhase = 'idle' | 'countdown' | 'shattering';
export const idleSnapshot = () => 'idle' as JourneyPhase;
export function intentionalDrag(x: number, y: number, startX: number, startY: number) {
 return Math.hypot(x - startX, y - startY) >= 8;
}
export function discoveryPath(locale: string, sample: number) {
 if (!['ar', 'en', 'nl'].includes(locale) || !Number.isFinite(sample) || sample < 0 || sample >= 1) throw new Error('INVALID_DISCOVERY_TARGET');
 return `/${locale}/services/${discoveryServices[Math.floor(sample * discoveryServices.length)]}`;
}
/** Starts only after the UI proves intentional input; no hover/idle timer. */
export function createSculptureJourney(options: {
 locale: string; enabled: boolean; navigate: (path: string) => void; random: () => number;
 schedule: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
 cancel: (timer: ReturnType<typeof setTimeout>) => void;
}) {
 let phase: JourneyPhase = 'idle', disposed = false;
 const timers = new Set<ReturnType<typeof setTimeout>>(), listeners = new Set<() => void>();
 const emit = (next: JourneyPhase) => { phase = next; listeners.forEach(listener => listener()); };
 const clear = () => { timers.forEach(timer => options.cancel(timer)); timers.clear(); };
 const later = (callback: () => void, delay: number) => {
  const timer = options.schedule(() => { timers.delete(timer); if (!disposed) callback(); }, delay); timers.add(timer);
 };
 return {
  activate() { disposed = false; },
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  snapshot: () => phase,
  start() {
   if (disposed || !options.enabled || phase !== 'idle') return false;
   emit('countdown');
   later(() => { emit('shattering'); later(() => { const target = discoveryPath(options.locale, options.random()); options.navigate(target); }, SCULPTURE_BREAK_MS); }, SCULPTURE_DRAG_MS);
   return true;
  },
  cancel() { clear(); if (!disposed) emit('idle'); },
  dispose() { clear(); disposed = true; listeners.clear(); },
 };
}