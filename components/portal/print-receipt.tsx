"use client";
import { localizeForLocale } from "@/lib/i18n/extra-locales";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintReceipt({ locale }: { locale: string }) {
  return <Button type="button" variant="outline" className="print:hidden" onClick={() => window.print()}><Printer className="size-4"/>{locale === "ar" ? "طباعة / حفظ PDF" : localizeForLocale("Print / save PDF", locale)}</Button>;
}
