"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** shadcn Input on the existing `.field` style. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn("field", className)} {...props} />;
}

export { Input };
