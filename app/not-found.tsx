import Link from "next/link";
import { fontVariables } from "@/lib/fonts";
// Rendered outside the [locale] segment, so it must pull in the stylesheet
// and font variables itself.
import "./globals.css";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body className="grid min-h-screen place-items-center bg-base text-ink-hi">
        <div className="text-center">
          <p className="text-7xl font-black text-gradient">404</p>
          <p className="mt-3 text-ink-low">This page could not be found.</p>
          <Button asChild variant="neon" className="mt-6 inline-block">
<Link href="/en">
            Back to AAKWHX
          </Link>
</Button>
        </div>
      </body>
    </html>
  );
}
