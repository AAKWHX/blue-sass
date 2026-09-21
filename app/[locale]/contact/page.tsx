import { AtSign, Mail, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";

export const metadata = { title: "Contact — Blue Sass" };

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const ar = locale === "ar";
  const entries = [
    { icon: Phone, title: ar ? "الهاتف وواتساب" : "Phone & WhatsApp", value: "+31 6 3454 3374", href: "tel:+31634543374" },
    { icon: Mail, title: ar ? "البريد الإلكتروني" : "Email", value: "etskar@bluesass.nl", href: "mailto:etskar@bluesass.nl" },
    { icon: AtSign, title: "Instagram", value: "@aakwhx", href: "https://instagram.com/aakwhx" },
  ];
  return <section className="section-y"><div className="container-x"><div className="mx-auto max-w-2xl text-center"><span className="mono-label">Blue Sass</span><h1 className="mt-4 text-4xl font-black sm:text-6xl">{ar ? "تواصل معنا" : "Get in touch"}</h1><p className="mt-5 text-lg leading-relaxed text-ink-low">{ar ? "أخبرنا عن فكرتك وسنساعدك في تحويلها إلى خطة مشروع واضحة." : "Tell us about your idea and we will help turn it into a clear project plan."}</p></div><div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-3">{entries.map(({ icon: Icon, title, value, href }) => <a key={title} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="glass-card group p-6 transition hover:border-neon-cyan/50"><Icon className="size-7 text-neon-cyan"/><h2 className="mt-8 font-bold">{title}</h2><p dir="ltr" className="mt-2 text-sm text-ink-low group-hover:text-ink-hi">{value}</p></a>)}</div></div></section>;
}
