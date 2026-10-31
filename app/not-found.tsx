import Link from "next/link";
import { fontVariables } from "@/lib/fonts";
// Rendered outside the [locale] segment, so it must pull in the stylesheet
// and font variables itself.
import "./globals.css";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body className="grid min-h-screen place-items-center bg-[#050608] text-white">
        <div className="text-center">
          <p className="text-7xl font-black text-gradient">404</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">This page could not be found.</h1>
          <Button asChild variant="neon" className="mt-6 inline-block">
<Link href="/en">
            Back to Blue Sass
          </Link>
</Button>
        </div>
      </body>
    </html>
  );
}
