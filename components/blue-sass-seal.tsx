import styles from './blue-sass-seal.module.css';

export interface BlueSassSealProps { caption?: string; logoSrc?: string; href?: string; theme?: 'dark' | 'light'; }
/** Standalone signature: no framework, router, font or JavaScript dependency. */
export function BlueSassSeal({ caption = 'Design & development', logoSrc = '/blue-sass-mark.svg', href = 'https://www.bluesass.nl', theme = 'dark' }: BlueSassSealProps) {
  return <a className={styles.seal} data-theme={theme} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${caption} — Blue Sass`}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={logoSrc} alt="" width="52" height="52" loading="lazy" decoding="async"/>
    <span><strong dir="ltr">Blue Sass</strong><span>{caption}</span></span>
  </a>;
}
