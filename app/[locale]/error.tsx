"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const copy = {
  ar: { title: "تعذر عرض الصفحة حاليًا", detail: "حاول مجددًا بعد قليل. لم يتم تأكيد نجاح أي عملية لم تظهر نتيجتها.", retry: "حاول مجددًا", home: "الرئيسية" },
  en: { title: "This page is temporarily unavailable", detail: "Please try again shortly. An operation without a confirmed result should not be assumed successful.", retry: "Try again", home: "Home" },
  nl: { title: "Deze pagina is tijdelijk niet beschikbaar", detail: "Probeer het straks opnieuw. Een handeling zonder bevestigde uitkomst mag niet als geslaagd worden beschouwd.", retry: "Opnieuw proberen", home: "Home" },
};

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const params = useParams();
  const locale = params.locale === "ar" ? "ar" : params.locale === "nl" ? "nl" : "en";
  const c = copy[locale];
  return <section className="container-x min-h-[60vh] py-24" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div role="alert" className="max-w-2xl"><h1 className="text-3xl font-bold">{c.title}</h1><p className="mt-5 leading-8">{c.detail}</p></div>
    <div className="mt-8 flex flex-wrap gap-4"><Button onClick={retry} variant="neon">{c.retry}</Button><Button asChild variant="outline"><Link href={`/${locale}`}>{c.home}</Link></Button></div>
  </section>;
}
