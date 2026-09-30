import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { HostingDashboard } from "@/components/hosting/hosting-dashboard";
import { db, isDatabaseConfigured } from "@/lib/db";
import { getViewer } from "@/lib/db/access";
import { hostedSites } from "@/lib/db/schema";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
const copy={ar:{title:"استضافة مواقعك",body:"ارفع فولدر موقع Static أو مشروع Next.js، وتابع النشر من حسابك.",login:"سجّل الدخول لرفع مشروعك"},en:{title:"Host your websites",body:"Upload a Static site or Next.js project and track deployment from your account.",login:"Sign in to upload"},nl:{title:"Host uw websites",body:"Upload een statische site of Next.js-project.",login:"Log in om te uploaden"},de:{title:"Websites hosten",body:"Laden Sie eine statische Site oder ein Next.js-Projekt hoch.",login:"Zum Hochladen anmelden"},tr:{title:"Sitelerinizi barındırın",body:"Static veya Next.js projenizi yükleyin.",login:"Yüklemek için giriş yapın"},fr:{title:"Hébergez vos sites",body:"Téléversez un site statique ou un projet Next.js.",login:"Se connecter pour téléverser"},es:{title:"Aloja tus sitios",body:"Sube un sitio estático o proyecto Next.js.",login:"Inicia sesión para subir"}} as const;
export default async function HostingPage({params}:{params:Promise<{locale:string}>}){const{locale:raw}=await params;if(!isLocale(raw))notFound();const c=copy[raw];const viewer=isDatabaseConfigured?await getViewer():null;const sites=viewer?await db.select().from(hostedSites).where(eq(hostedSites.userId,viewer.id)).orderBy(desc(hostedSites.createdAt)):[];return <div className="bg-base"><div className="container-x py-16 sm:py-24"><h1 className="max-w-4xl text-5xl font-black text-black sm:text-7xl">{c.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-ink-low">{c.body}</p><div className="mt-12">{viewer?<HostingDashboard locale={raw} initialSites={sites}/>:<Button asChild variant="neon"><Link href={`/${raw}/login?next=/${raw}/hosting`}>{c.login}</Link></Button>}</div></div></div>}
