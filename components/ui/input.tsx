"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** shadcn Input on the existing `.field` style. */
function Input({ className, type, onWheel, inputMode, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" inputMode={inputMode ?? (type === "number" ? "decimal" : undefined)} className={cn("field", className)} onWheel={event => {
    onWheel?.(event);
    // Release the native spinbutton before its wheel default changes a value.
    // Scrolling the page remains available and arrow-key editing is preserved.
    if (type === "number" && !event.defaultPrevented) event.currentTarget.blur();
  }} {...props} />;
}

export { Input };
