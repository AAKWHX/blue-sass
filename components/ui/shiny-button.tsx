"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShinyButtonProps = Omit<React.ComponentProps<typeof Button>, "variant">;

/**
 * Standalone entry point for the animated CTA supplied in the design prompt.
 * It delegates to the shared shadcn Button so focus, disabled and Slot
 * behaviour stay consistent with the rest of the application.
 */
function ShinyButton({ className, ...props }: ShinyButtonProps) {
  return <Button variant="neon" className={cn(className)} {...props} />;
}

export { ShinyButton };
