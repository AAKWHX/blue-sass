"use client";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NavigationContext = createContext<((href: string, event: MouseEvent<HTMLAnchorElement>) => void) | null>(null);

/** Confined to the prototype segment; App Router still owns history and route rendering. */
export function PreviewNavigation({ children }: { children: ReactNode }) {
  const router = useRouter(); const pathname = usePathname(); const previous = useRef(pathname);
  const curtain = useRef<HTMLDivElement>(null); const locked = useRef(false); const timer = useRef<ReturnType<typeof setTimeout> | null>(null); const animation = useRef<Animation | null>(null);
  const release = useCallback(() => {
    animation.current?.cancel(); if (curtain.current) curtain.current.style.transform = 'translateY(100%)';
    locked.current = false; if (timer.current) clearTimeout(timer.current);
  }, []);
  const uncover = useCallback(() => {
    const node = curtain.current; if (!node) return release();
    animation.current?.cancel(); node.style.transform = 'translateY(0)';
    animation.current = node.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 500, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
    void animation.current.finished.then(() => { release(); const heading = document.querySelector<HTMLElement>('[data-preview-page] [data-scene-active="true"] :is(h1,h2)') || document.querySelector<HTMLElement>('[data-preview-page] h1'); heading?.focus({ preventScroll: true }); }).catch(() => {});
  }, [release]);
  useLayoutEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { release(); return; }
    uncover();
  }, [pathname, release, uncover]);
  useEffect(() => () => release(), [release]);
  const navigate = useCallback((href: string, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!curtain.current || href === pathname) return;
    event.preventDefault(); if (locked.current) return; locked.current = true;
    timer.current = setTimeout(uncover, 2200);
    animation.current = curtain.current.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
    void animation.current.finished.then(() => { if (curtain.current) curtain.current.style.transform = 'translateY(0)'; router.push(href); }).catch(release);
  }, [pathname, router, release, uncover]);
  return <NavigationContext.Provider value={navigate}><div data-motion-preview-shell>{children}<div ref={curtain} className="mp-route-curtain z-overlay" aria-hidden="true"><Image src="/blue-sass-mark.svg" alt="" width={80} height={80}/><span dir="ltr">Blue Sass</span></div></div></NavigationContext.Provider>;
}

export function PreviewLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const navigate = useContext(NavigationContext);
  return <Link href={href} className={className} onClick={event => navigate?.(href, event)}>{children}</Link>;
}
