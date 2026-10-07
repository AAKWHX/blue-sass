import Link from "next/link";
import {redirect,notFound} from "next/navigation";
import {getViewer} from "@/lib/db/access";
import {ownListings} from "@/lib/db/marketplace";
import {businessUi} from "@/lib/i18n/business-ui";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {isLocale} from "@/lib/i18n/config";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {archiveListingAction} from "@/app/actions/marketplace";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const viewer=await getViewer();if(!viewer)redirect(`/${locale}/login`);const rows=await ownListings(viewer.id);const c=businessUi(locale);const t=toolsUi(locale);
 return <div className="tool-surface py-12"><div className="container-x max-w-5xl"><div className="flex flex-wrap items-center justify-between gap-5"><h1 className="text-3xl font-semibold">{c.myListings}</h1><Button asChild variant="neon"><Link href={`/${locale}/portal/listings/new`}>{c.create}</Link></Button></div><div className="mt-8 grid gap-5 md:grid-cols-2">{rows.map(row=><article key={row.id} className="tool-card rounded-xl border p-6"><h2 className="text-xl">{row.title}</h2><p className="my-3 text-sm">{row.category} · {row.status==="approved"?c.published:row.status==="pending"?c.pending:row.status==="rejected"?c.rejected:row.status}</p><div className="grid gap-3">{row.kind==="job"&&row.tier!=="basic"&&<Button asChild variant="neon"><Link href={`/${locale}/portal/purchases`}>{c.buy}</Link></Button>}<Button asChild variant="outline"><Link href={`/${locale}/listings/${row.id}`}>{t.details}</Link></Button>{row.status!=="archived"&&<form action={archiveListingAction}><Input type="hidden" name="id" value={row.id}/><Button type="submit" variant="outline" className="w-full">{t.all} · ×</Button></form>}</div></article>)}</div>{!rows.length&&<p className="mt-8">{t.empty}</p>}</div></div>;}
