import Link from "next/link";
import {redirect,notFound} from "next/navigation";
import {getViewer} from "@/lib/db/access";
import {purchases} from "@/lib/db/marketplace";
import {businessUi} from "@/lib/i18n/business-ui";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {paymentCopy} from "@/lib/i18n/payment-copy";
import {isLocale} from "@/lib/i18n/config";
import {Button} from "@/components/ui/button";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const viewer=await getViewer();if(!viewer)redirect(`/${locale}/login`);const rows=await purchases(viewer.id);const c=businessUi(locale);const t=toolsUi(locale);
 return <div className="tool-surface py-12"><div className="container-x max-w-5xl"><h1 className="text-3xl font-semibold">{c.myFiles}</h1><div className="mt-8 grid gap-5 md:grid-cols-2">{rows.map(row=><article key={row.id} className="tool-card rounded-xl border p-6"><h2 className="text-xl">{row.title.title}</h2><p className="my-3 text-sm">€{row.title.price} · {row.status??"pending"}</p><div className="grid gap-3">{row.status==="paid"&&row.kind==="product"?<Button asChild variant="neon"><a href={`/api/products/${row.id}/download`}>{t.download}</a></Button>:row.status!=="paid"?row.listingStatus==="approved"?<Button asChild variant="neon"><Link href={`/${locale}/portal/projects/${row.id}/payment`}>{paymentCopy[locale].title}</Link></Button>:<p>{c.pending}</p>:<Button asChild variant="outline"><Link href={`/${locale}/listings/${row.listingId}`}>{t.details}</Link></Button>}</div></article>)}</div>{!rows.length&&<p className="mt-8">{t.empty}</p>}</div></div>;}
