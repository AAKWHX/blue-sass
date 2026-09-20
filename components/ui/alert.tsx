"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * shadcn Alert. Carries role="alert", so status messages (e.g. "quote
 * submitted") are announced by screen readers instead of appearing silently
 * as a styled <p>.
 */
const alertVariants = cva("relative w-full rounded-xl border px-4 py-3 text-sm font-medium", {
  variants: {
    variant: {
      default: "border-line bg-white/[0.03] text-ink-mid",
      success: "border-neon-emerald/30 bg-neon-emerald/10 text-neon-emerald",
      destructive: "border-rose-500/35 bg-rose-500/10 text-rose-300",
    },
  },
  defaultVariants: { variant: "default" },
});

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("font-semibold tracking-tight", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("text-sm opacity-90", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
