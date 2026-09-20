import { cn } from "@/lib/utils";

export function BrandLogo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)} aria-label="Blue Sass">
      <svg viewBox="0 0 48 48" role="img" aria-hidden="true" className="h-10 w-10 shrink-0">
        <defs>
          <linearGradient id="blue-sass-mark" x1="7" y1="5" x2="42" y2="43" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67E8F9" />
            <stop offset="0.52" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="14" fill="#08111F" stroke="url(#blue-sass-mark)" strokeWidth="1.5" />
        <path d="M15 13h11.2c5.1 0 8.3 2.5 8.3 6.4 0 2.5-1.3 4.4-3.6 5.5 3.1.9 4.8 3.2 4.8 6.2 0 4.6-3.7 7.4-9.6 7.4H15V13Zm10.4 10c2.5 0 3.9-1 3.9-2.8 0-1.8-1.4-2.7-3.9-2.7h-5.1V23h5.1Zm.6 11c2.8 0 4.4-1.1 4.4-3.2 0-2-1.6-3.1-4.4-3.1h-5.7V34H26Z" fill="url(#blue-sass-mark)" />
      </svg>
      {showName && <span className="text-base font-black tracking-tight text-ink-hi">Blue Sass</span>}
    </span>
  );
}
