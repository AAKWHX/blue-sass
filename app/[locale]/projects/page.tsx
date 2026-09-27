import { Portfolio } from "@/components/public/portfolio";

export const metadata = { title: "أعمال ومشاريع بلو ساس", description: "نماذج من مواقع وتطبيقات ومنتجات رقمية صممتها وطورتها بلو ساس." };

/** A dedicated route makes the showcase easy to find without duplicating it. */
export default function ProjectsPage() {
  return <Portfolio />;
}
