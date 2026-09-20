"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * shadcn Checkbox. A native checkbox cannot be styled to match the neon
 * surface (accent-color only tints the tick); Radix renders a real button
 * with aria-checked and full keyboard support.
 */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded border border-line-strong bg-white/[0.02] shadow-sm transition-colors outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "data-[state=checked]:border-neon-cyan data-[state=checked]:bg-neon-cyan data-[state=checked]:text-base",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check className="size-3.5" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
