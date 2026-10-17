import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, showName = true }: { className?: string; showName?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)} aria-label="Blue Sass">
      <Image src="/blue-sass-mark.svg" alt="" aria-hidden="true" width={40} height={40} className="h-10 w-10 shrink-0" />
      {showName && <span className="text-base font-black tracking-tight text-ink-hi">Blue Sass</span>}
    </span>
  );
}
