"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, Check } from "lucide-react";
import { useI18n } from "@/components/providers";
import { Reveal, motion } from "@/components/ui/motion";
import { serviceCatalog } from "@/lib/service-catalog";

const art = ["/media/web-design-3d.webp", "/media/mobile-ai-3d.webp"];

export function Services() {
  const { locale, t } = useI18n();
  const ar = locale === "ar";
  const services = serviceCatalog(locale);
  return (
    <section id="services" className="section-y bg-white">
      <div className="container-x">
        <Reveal className="text-center"><span className="text-sm font-bold text-neon-magenta">✦ {ar ? "الخدمات" : t.services.title}</span><h2 className="mx-auto mt-3 max-w-3xl text-4xl font-bold text-black sm:text-6xl">{ar ? "كل ما يحتاجه مشروعك الرقمي" : t.services.subtitle}</h2><p className="mx-auto mt-5 max-w-2xl leading-8 text-ink-low">{t.hero.subtitle}</p></Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {[0, 1].map((group) => <Reveal key={group} delay={group * .08}>
            <motion.article whileHover={{ y: -8 }} className={`h-full overflow-hidden rounded-3xl border border-black ${group ? "bg-[#f7f3ee]" : "bg-neon-cyan"}`}>
              <div className="relative h-72 overflow-hidden sm:h-96"><Image src={art[group]} alt={group ? (ar ? "تطبيقات وذكاء اصطناعي ثلاثية الأبعاد" : "3D mobile and AI") : (ar ? "تصميم وتطوير مواقع ثلاثي الأبعاد" : "3D web design and development")} fill className="object-cover" sizes="(min-width:1024px) 50vw, 100vw" /></div>
              <div className="p-7 sm:p-9"><h3 className="text-3xl font-bold text-black">{group ? (ar ? "تطبيقات وأنظمة ذكية" : "Apps & intelligent systems") : (ar ? "مواقع ومتاجر رقمية" : "Websites & online stores")}</h3><p className="mt-3 leading-8 text-black/70">{group ? services[6].description : services[0].description}</p><Link href={`/${locale}/services`} className="mt-7 inline-flex items-center gap-2 rounded-xl border border-black bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neon-blue">{ar ? "استكشف الخدمات" : "Explore services"}<ArrowUpLeft className="size-4 flip-x"/></Link></div>
            </motion.article>
          </Reveal>)}
        </div>

        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-black bg-black sm:grid-cols-2 lg:grid-cols-4">
          {services.map((item, index) => <Reveal key={item.slug} className="h-full"><Link href={`/${locale}/services/${item.slug}`} className="group flex h-full min-h-64 flex-col bg-[#fffdfa] p-6 transition hover:bg-neon-cyan"><span className="font-mono text-xs font-bold text-neon-blue">0{index + 1}</span><h3 className="mt-6 text-xl font-bold text-black">{item.title}</h3><p className="mt-3 text-sm leading-7 text-ink-low group-hover:text-black/70">{item.description}</p><ul className="mt-auto space-y-2 pt-6">{item.features.slice(0, 2).map((feature) => <li key={feature} className="flex items-center gap-2 text-xs font-semibold text-black"><Check className="size-3.5" />{feature}</li>)}</ul></Link></Reveal>)}
        </div>
      </div>
    </section>
  );
}
