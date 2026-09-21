import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, Layers3, Rocket } from "lucide-react";
import { getDictionary, isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Start a project — Blue Sass" };

export default async function CreateProjectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const t = getDictionary(locale);
  const ar = locale === "ar";
  const steps = ar
    ? [["اختر نوع مشروعك", "موقع أو متجر أو تطبيق جوال أو نظام ذكي."], ["حدّد ما تحتاجه", "اختر الميزات والنطاق والخدمات الشهرية."], ["احفظ الطلب", "راجعه معنا ثم ادفع العربون عند الجاهزية."]]
    : [["Choose your product", "Website, store, mobile app or intelligent system."], ["Select what you need", "Choose features, scope and recurring services."], ["Save your request", "Review it with us and pay the deposit when ready."]];
  const icons = [Compass, Layers3, Rocket];
  return <section className="section-y"><div className="container-x"><div className="mx-auto max-w-4xl text-center"><span className="mono-label">Blue Sass</span><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{ar ? "ابدأ مشروعك بخطوات واضحة" : "Start your project with clear steps"}</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-low">{ar ? "من فكرتك الأولى إلى طلب مرتب قابل للمراجعة والدفع." : "Turn your first idea into a structured request that is ready for review and payment."}</p></div><div className="mt-14 grid gap-5 md:grid-cols-3">{steps.map(([title, desc], i) => { const Icon = icons[i]; return <article key={title} className="glass-card p-6"><Icon className="size-7 text-neon-cyan"/><span className="mt-7 block font-mono text-xs text-neon-cyan">0{i + 1}</span><h2 className="mt-2 text-xl font-bold">{title}</h2><p className="mt-3 text-sm leading-relaxed text-ink-low">{desc}</p><CheckCircle2 className="mt-6 size-5 text-neon-emerald"/></article>; })}</div><div className="mt-12 text-center"><Button asChild variant="neon" className="group !px-7 !py-3.5"><Link href={`/${locale}/quote`}>{t.hero.ctaPrimary}<ArrowRight className="size-4 flip-x transition-transform group-hover:translate-x-1"/></Link></Button></div></div></section>;
}
