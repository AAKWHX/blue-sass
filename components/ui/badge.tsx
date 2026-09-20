"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-tight whitespace-nowrap w-fit [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "border-line bg-white/[0.03] text-ink-low",
        neon: "border-neon-cyan/35 bg-neon-cyan/[0.08] text-neon-cyan",
        emerald: "border-neon-emerald/30 bg-neon-emerald/[0.10] text-neon-emerald",
        magenta: "border-neon-magenta/30 bg-neon-magenta/[0.10] text-neon-magenta",
        outline: "border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
