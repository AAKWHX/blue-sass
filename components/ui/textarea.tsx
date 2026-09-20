"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** shadcn Textarea on the existing `.field` style. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn("field min-h-24 resize-y", className)} {...props} />;
}

export { Textarea };
