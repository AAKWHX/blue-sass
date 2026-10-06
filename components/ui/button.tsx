"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useFormStatus } from "react-dom";

/**
 * shadcn Button, restyled onto the AWWA neon system.
 *
 * `neon` is the site's high-emphasis shiny CTA. Keeping it as a variant means
 * links, form actions and navigation CTAs share one accessible implementation.
 */
const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neon: "shiny-cta",
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
  onClick,
  disabled,
  type,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  const form = useFormStatus();
  const [pressed, setPressed] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const pending = !asChild && type !== "button" && form.pending;
  function click(event: React.MouseEvent<HTMLButtonElement>) {
    if (pending || pressed || disabled) { event.preventDefault(); return; }
    onClick?.(event);
    setPressed(true);
    timer.current = setTimeout(() => setPressed(false), 600);
  }
  return <Comp {...props} type={type} onClick={click} disabled={asChild ? undefined : disabled || pending}
    aria-busy={pending || undefined} aria-disabled={asChild && disabled ? true : undefined}
    data-pressed={pressed || pending ? "true" : undefined} data-pending={pending ? "true" : undefined}
    data-slot="button" data-variant={variant ?? "default"} data-size={size ?? "default"}
    className={cn(buttonVariants({ variant, size }), variant !== "unstyled" && variant !== "link" && size !== "icon" && "site-action", className)} />;
}

export { Button, buttonVariants };
