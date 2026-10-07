import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageChecker } from "@/components/public/message-checker";
import { messageToolCopy } from "@/lib/i18n/message-tool";
import { isLocale, locales } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) return {};
  const c = messageToolCopy(locale); const path = `/${locale}/tools/message-checker`;
  return { title: `${c.title} | Blue Sass`, description: c.privacy,
    alternates: { canonical: path, languages: Object.fromEntries(locales.map(value => [value, `/${value}/tools/message-checker`])) },
    openGraph: { title: c.title, description: c.privacy, url: path } };
}
export default async function MessageToolPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const c = messageToolCopy(locale);
  return <div className="tool-surface"><div className="container-x max-w-4xl py-12 sm:py-20">
    <Link href={`/${locale}/tools`} className="text-sm text-white/75 underline underline-offset-4">{c.tools}</Link>
    <h1 className="mb-8 mt-5 text-3xl font-semibold leading-tight text-white sm:text-5xl">{c.title}</h1>
    <MessageChecker locale={locale} />
  </div></div>;
}
