import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary, isLocale } from "@/lib/i18n";

const slugs = ["web", "mobile", "ai", "cloud", "design", "security"] as const;
const quoteTypes = { web: "web", mobile: "mobile", ai: "ai", cloud: "erp", design: "brand", security: "web" } as const;
const copy = {
  ar: { what: "ما الذي ستحصل عليه؟", steps: "من الفكرة إلى الإطلاق", estimate: "احسب تكلفة مشروعك", points: ["تخطيط واضح ونطاق عمل موثّق", "تصميم متجاوب وسهل الاستخدام", "تنفيذ آمن وقابل للتوسع", "اختبار وإطلاق ودعم مستمر"] },
  en: { what: "What you receive", steps: "From idea to launch", estimate: "Estimate your project", points: ["A clear plan and documented scope", "Responsive, accessible design", "Secure and scalable implementation", "Testing, launch and ongoing support"] },
  nl: { what: "Wat u ontvangt", steps: "Van idee tot lancering", estimate: "Bereken uw project", points: ["Een duidelijk plan en vastgelegde scope", "Responsief en toegankelijk ontwerp", "Veilige en schaalbare realisatie", "Testen, lancering en doorlopende support"] },
  de: { what: "Was Sie erhalten", steps: "Von der Idee bis zum Start", estimate: "Projekt kalkulieren", points: ["Klarer Plan und dokumentierter Umfang", "Responsives, barrierearmes Design", "Sichere und skalierbare Umsetzung", "Tests, Launch und laufender Support"] },
  tr: { what: "Neler sunuyoruz?", steps: "Fikirden yayına", estimate: "Projenizi hesaplayın", points: ["Net plan ve belgelenmiş kapsam", "Duyarlı ve erişilebilir tasarım", "Güvenli ve ölçeklenebilir geliştirme", "Test, yayın ve sürekli destek"] },
  fr: { what: "Ce que vous recevez", steps: "De l’idée au lancement", estimate: "Estimer votre projet", points: ["Un plan clair et un périmètre documenté", "Un design adaptatif et accessible", "Une réalisation sûre et évolutive", "Tests, lancement et support continu"] },
  es: { what: "Lo que recibirá", steps: "De la idea al lanzamiento", estimate: "Calcule su proyecto", points: ["Plan claro y alcance documentado", "Diseño adaptable y accesible", "Implementación segura y escalable", "Pruebas, lanzamiento y soporte continuo"] },
} as const;

export function generateStaticParams() {
  return slugs.map((service) => ({ service }));
}

export default async function ServicePage({ params }: { params: Promise<{ locale: string; service: string }> }) {
  const { locale: rawLocale, service } = await params;
  if (!isLocale(rawLocale) || !slugs.includes(service as typeof slugs[number])) notFound();
  const locale = rawLocale;
  const index = slugs.indexOf(service as typeof slugs[number]);
  const t = getDictionary(locale);
  const item = t.services.items[index];
  const c = copy[locale];

  return (
    <div className="container-x py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <Link href={`/${locale}#services`} className="text-sm text-neon-cyan hover:underline">← {t.nav.services}</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{item.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-low">{item.desc}</p>
            <div className="mt-8 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="chip">{tag}</span>)}</div>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-neon-cyan/15 via-elevated to-neon-purple/10 p-8 shadow-2xl">
            <div className="absolute inset-0 cyber-grid opacity-25" />
            <div className="relative grid h-full place-items-center"><div className="h-40 w-40 rotate-12 rounded-[2.5rem] border border-neon-cyan/40 bg-neon-cyan/10 shadow-glow-cyan [transform:perspective(700px)_rotateX(55deg)_rotateZ(35deg)]" /></div>
          </div>
        </div>
        <section className="mt-20">
          <h2 className="text-3xl font-bold">{c.what}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">{c.points.map((point) => <div key={point} className="glass-card flex items-start gap-3 p-5"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-neon-cyan" /><span>{point}</span></div>)}</div>
        </section>
        <section className="mt-20 rounded-[2rem] border border-line bg-elevated/70 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-bold">{c.steps}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-ink-low">{t.process.subtitle}</p>
          <Button asChild variant="neon" className="mt-8"><Link href={`/${locale}/quote?type=${quoteTypes[service as keyof typeof quoteTypes]}`}>{c.estimate}<ArrowRight className="h-4 w-4 flip-x" /></Link></Button>
        </section>
      </div>
    </div>
  );
}
