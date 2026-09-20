"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * shadcn Button, restyled onto the AWWA neon system.
 *
 * `neon` and `ghostNeon` reproduce the previous .btn-primary / .btn-ghost
 * exactly (animated gradient + shimmer sweep) so swapping <a>/<button> tags
 * for this component changed no visuals.
 */
const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neon: "btn-primary",
        ghostNeon: "btn-ghost",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-secondary/60 hover:text-foreground",
        ghost: "hover:bg-secondary/60 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        /**
         * No colours, no padding — for buttons that carry their own complete
         * styling (filter chips, selectable cards, icon triggers). Keeps the
         * semantic <button> and focus ring without imposing a look.
         */
        unstyled: "",
      },
      size: {
        default: "h-11 px-5 py-3",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-7",
        icon: "size-10",
        /** Size dictated entirely by the caller's className. */
        auto: "",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
