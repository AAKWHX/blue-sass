import { RecoveryForm } from "@/components/auth/recovery-form";
export const metadata = { title: "Account recovery — Blue Sass", robots: { index: false, follow: false } };
export default function RecoveryPage() { return <section className="container-x flex justify-center py-12 sm:py-20"><RecoveryForm /></section>; }
