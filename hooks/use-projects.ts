"use client";

import { projects as mockProjects } from "@/lib/mock-data";
import type { Project } from "@/lib/demo-types";

/**
 * Demo project dataset for the marketing pages.
 *
 * Live project data now comes from Neon via server components
 * (`lib/db/queries.ts`), so this hook no longer performs any client-side
 * fetching — it simply exposes the bundled portfolio content.
 */
export function useProjects(): { data: Project[]; loading: boolean; source: "mock" } {
  return { data: mockProjects, loading: false, source: "mock" };
}
