import type { Metadata } from "next";
import { ToolsDirectory } from "@/components/public/tools-directory";
import { toolsUi } from "@/lib/i18n/tools-ui";
import { notFound } from "next/navigation";
import { messageToolCopy } from "@/lib/i18n/message-tool";
import { isLocale, locales } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) return {};
  const c = messageToolCopy(locale);
  return { title: `${c.tools} | Blue Sass`, description: `${c.audit} · ${c.title} · ${c.quote}`,
    alternates: { canonical: `/${locale}/tools`, languages: Object.fromEntries(locales.map(value => [value, `/${value}/tools`])) } };
}
export default async function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const c = messageToolCopy(locale);
  return <div className="tool-surface"><div className="container-x max-w-6xl py-12 sm:py-20">
    <h1 className="text-3xl font-semibold text-white sm:text-5xl">{c.tools}</h1>
    <p className="mt-4 text-lg text-white/70">{toolsUi(locale).heading}</p>
    <ToolsDirectory locale={locale}/>
  </div></div>;
}
