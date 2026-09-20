"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

/**
 * shadcn Progress. Radix emits the correct role/aria-valuenow, replacing the
 * hand-written role="progressbar" div.
 * RTL-safe: the indicator is translated with a logical sign so it fills from
 * the reading edge in both directions.
 */
function Progress({
  className,
  indicatorClassName,
  value = 0,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={pct}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-line", className)}
      {...props}
    >
      {/* Width (not translateX) so the bar grows from the inline start in
          both LTR and RTL without needing a direction-aware transform. */}
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple shadow-glow-cyan transition-[width] duration-1000 ease-out",
          indicatorClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
