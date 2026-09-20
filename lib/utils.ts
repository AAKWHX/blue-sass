import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn's class helper: clsx for conditionals, tailwind-merge to make later
 * utilities win over earlier ones instead of both landing in the class list.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
