import styles from "./blue-sass-signature.module.css";

export interface BlueSassSignatureProps {
  variant?: "light" | "dark";
  size?: "compact" | "ultra-compact";
  tagline?: string;
  logoSrc?: string;
  label?: string;
}

/** Portable React component: copy this file, its CSS module and the logo asset. */
export function BlueSassSignature({ variant = "dark", size = "compact", tagline, logoSrc = "/blue-sass-mark.svg", label = "Crafted by Blue Sass — visit the Blue Sass website" }: BlueSassSignatureProps) {
  return <a className={styles.signature} data-theme={variant} data-size={size} href="https://www.bluesass.nl" target="_blank" rel="noopener noreferrer" aria-label={label} dir="ltr">
    {/* A native image keeps this component portable to React without Next.js. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={logoSrc} width="24" height="24" alt="" decoding="async" />
    <span>Crafted by <strong>Blue Sass</strong>{tagline && <small>{tagline}</small>}</span>
  </a>;
}
