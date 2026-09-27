import { LivePortfolio } from "@/components/public/live-portfolio";
import { portfolioEntries } from "@/lib/db/portfolio";

export const metadata = { title: "أعمال ومشاريع بلو ساس", description: "نماذج من مواقع وتطبيقات ومنتجات رقمية صممتها وطورتها بلو ساس." };

/** A dedicated route makes the showcase easy to find without duplicating it. */
export default async function ProjectsPage() {
  return <LivePortfolio entries={await portfolioEntries()} />;
}
