import { Portfolio } from "@/components/public/portfolio";

export const metadata = { title: "Projects — Blue Sass" };

/** A dedicated route makes the showcase easy to find without duplicating it. */
export default function ProjectsPage() {
  return <Portfolio />;
}
