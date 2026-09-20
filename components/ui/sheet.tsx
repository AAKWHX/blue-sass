"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * shadcn Sheet — a Dialog anchored to an edge. Used for the mobile nav, which
 * was previously a plain conditional <div>: no focus trap, no Escape, no
 * scroll lock, and focus could tab behind the open menu into the page.
 */
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-overlay bg-base/80 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * `side` uses logical inline positioning so "start"/"end" follow the reading
 * direction — the sheet opens from the correct edge in Arabic without a
 * separate RTL branch.
 */
function SheetContent({
  className,
  children,
  side = "end",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "start" | "end" | "top" | "bottom" }) {
  const sideClasses = {
    start: "inset-y-0 start-0 h-full w-80 max-w-[85vw] border-e",
    end: "inset-y-0 end-0 h-full w-80 max-w-[85vw] border-s",
    top: "inset-x-0 top-0 w-full border-b",
    bottom: "inset-x-0 bottom-0 w-full border-t",
  }[side];

  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-overlay flex flex-col gap-4 border-line bg-base/95 p-6 shadow-card backdrop-blur-xl",
          "transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          sideClasses,
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute end-4 top-4 rounded-lg p-2 text-ink-low transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring outline-none">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-bold text-ink-hi", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-ink-low", className)}
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription };
