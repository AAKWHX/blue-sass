import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, PackageCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary, isLocale } from "@/lib/i18n";
import { serviceCatalog, serviceSlugs } from "@/lib/service-catalog";
import { ServiceArt } from "@/components/public/service-art";
import { Reveal } from "@/components/ui/motion";
import { serviceDetails } from "@/lib/service-details";
import { TemplateGallery } from "@/components/public/template-gallery";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; service: string }> }) {
 const { locale, service } = await params;
 const item = serviceCatalog("ar").find(item => item.slug === service);
 return item ? pageMetadata(locale, `/services/${service}`, `${item.title} — بلو ساس`, item.description) : {};
}

const slugs = serviceSlugs;
const copy = {
  ar: { what: "مخرجات هذه الخدمة", steps: "مسار تنفيذ مخصص لهذه الخدمة", estimate: "ابدأ مشروعًا بهذه التفاصيل", ideal: "مناسبة لـ", result: "النتيجة المتوقعة", timeline: "المدة التقديرية", points: ["تخطيط واضح ونطاق عمل موثّق", "تصميم متجاوب وسهل الاستخدام", "تنفيذ آمن وقابل للتوسع", "اختبار وإطلاق ودعم مستمر"] },
  en: { what: "Service deliverables", steps: "A delivery path tailored to this service", estimate: "Start with these details", ideal: "Best for", result: "Expected outcome", timeline: "Estimated timeline", points: ["A clear plan and documented scope", "Responsive, accessible design", "Secure and scalable implementation", "Testing, launch and ongoing support"] },
  nl: { what: "Resultaten van de dienst", steps: "Een traject op maat voor deze dienst", estimate: "Start met deze details", ideal: "Geschikt voor", result: "Verwacht resultaat", timeline: "Geschatte doorlooptijd", points: ["Een duidelijk plan en vastgelegde scope", "Responsief en toegankelijk ontwerp", "Veilige en schaalbare realisatie", "Testen, lancering en doorlopende support"] },
  de: { what: "Leistungsumfang", steps: "Ein passender Ablauf für diese Leistung", estimate: "Mit diesen Details starten", ideal: "Geeignet für", result: "Erwartetes Ergebnis", timeline: "Geschätzte Dauer", points: ["Klarer Plan und dokumentierter Umfang", "Responsives, barrierearmes Design", "Sichere und skalierbare Umsetzung", "Tests, Launch und laufender Support"] },
  tr: { what: "Hizmet çıktıları", steps: "Bu hizmete özel teslim süreci", estimate: "Bu ayrıntılarla başlayın", ideal: "Kimler için", result: "Beklenen sonuç", timeline: "Tahmini süre", points: ["Net plan ve belgelenmiş kapsam", "Duyarlı ve erişilebilir tasarım", "Güvenli ve ölçeklenebilir geliştirme", "Test, yayın ve sürekli destek"] },
  fr: { what: "Livrables du service", steps: "Un parcours adapté à ce service", estimate: "Démarrer avec ces détails", ideal: "Idéal pour", result: "Résultat attendu", timeline: "Délai estimé", points: ["Un plan clair et un périmètre documenté", "Un design adaptatif et accessible", "Une réalisation sûre et évolutive", "Tests, lancement et support continu"] },
  es: { what: "Entregables del servicio", steps: "Un proceso adaptado a este servicio", estimate: "Empezar con estos detalles", ideal: "Ideal para", result: "Resultado esperado", timeline: "Plazo estimado", points: ["Plan claro y alcance documentado", "Diseño adaptable y accesible", "Implementación segura y escalable", "Pruebas, lanzamiento y soporte continuo"] },
} as const;

export function generateStaticParams() {
  return slugs.map((service) => ({ service }));
}

export default async function ServicePage({ params }: { params: Promise<{ locale: string; service: string }> }) {
  const { locale: rawLocale, service } = await params;
  if (!isLocale(rawLocale)) notFound();
  const aliases: Record<string, string> = { mobile: "android", cloud: "erp", security: "web" };
  if (aliases[service]) permanentRedirect(`/${rawLocale}/services/${aliases[service]}`);
  if (!isLocale(rawLocale) || !slugs.includes(service as typeof slugs[number])) notFound();
  const locale = rawLocale;
  const index = slugs.indexOf(service as typeof slugs[number]);
  const t = getDictionary(locale);
  const item = serviceCatalog(locale)[index];
  const c = copy[locale];
  const detail = serviceDetails(locale)[service as typeof slugs[number]];

  return (
    <div className="bg-base"><div className="container-x py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <Link href={`/${locale}/services`} className="text-sm font-bold text-neon-blue hover:underline">← {t.nav.services}</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{item.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-low">{item.description}</p>
            <Button asChild variant="neon" className="mt-8"><Link href={`/${locale}/quote?type=${item.quoteType}&service=${item.slug}`}>{t.hero.ctaPrimary}<ArrowRight className="size-4 flip-x"/></Link></Button>
          </div>
          <Reveal className="group overflow-hidden rounded-3xl border border-black bg-white p-3"><ServiceArt kind={item.slug} label={item.title}/></Reveal>
        </div>
        <section className="mt-14 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-black bg-neon-cyan p-6"><Target className="size-6"/><h2 className="mt-5 text-sm font-bold text-black/60">{c.ideal}</h2><p className="mt-2 font-bold leading-7 text-black">{detail.idealFor}</p></article>
          <article className="rounded-2xl border border-black bg-white p-6"><PackageCheck className="size-6"/><h2 className="mt-5 text-sm font-bold text-black/60">{c.result}</h2><p className="mt-2 font-bold leading-7 text-black">{detail.outcome}</p></article>
          <article className="rounded-2xl border border-black bg-black p-6 text-white"><Clock3 className="size-6 text-neon-cyan"/><h2 className="mt-5 text-sm font-bold text-white/55">{c.timeline}</h2><p className="mt-2 text-2xl font-bold text-white">{detail.timeline}</p></article>
        </section>
        <section className="mt-20">
          <h2 className="text-3xl font-bold">{c.what}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">{item.features.map((point) => <Reveal key={point} className="rounded-2xl border border-black bg-white p-6"><CheckCircle2 className="h-5 w-5 text-neon-blue" /><h3 className="mt-5 font-semibold text-black">{point}</h3></Reveal>)}</div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">{c.points.map(point=><li key={point} className="flex gap-3 text-ink-low"><CheckCircle2 className="size-5 shrink-0"/>{point}</li>)}</ul>
        </section>
        <section className="mt-20 rounded-[2rem] border border-black bg-neon-cyan p-8 text-center sm:p-12">
          <h2 className="text-3xl font-bold">{c.steps}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-ink-low">{t.process.subtitle}</p>
          <Button asChild variant="neon" className="mt-8"><Link href={`/${locale}/quote?type=${item.quoteType}&service=${item.slug}`}>{c.estimate}<ArrowRight className="h-4 w-4 flip-x" /></Link></Button>
        </section>
      </div>
    </div><TemplateGallery service={item.slug}/></div>
  );
}
