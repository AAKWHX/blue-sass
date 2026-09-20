"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * shadcn Card wired to the existing `.glass-card` surface so every panel in
 * the app shares one definition instead of repeating border/blur utilities.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn("glass-card flex flex-col", className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3 data-slot="card-title" className={cn("text-lg font-bold leading-tight text-ink-hi", className)} {...props} />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-description" className={cn("text-sm text-ink-low", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
