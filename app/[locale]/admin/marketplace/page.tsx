import Link from "next/link";
import {notFound} from "next/navigation";
import {desc} from "drizzle-orm";
import {requirePermission} from "@/lib/db/access";
import {db} from "@/lib/db";
import {marketplaceListings} from "@/lib/db/schema";
import {listingColumns} from "@/lib/db/marketplace";
import {isLocale} from "@/lib/i18n/config";
import {businessUi} from "@/lib/i18n/business-ui";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {moderateListingAction} from "@/app/actions/marketplace";
export default async function Page({params}:{params:Promise<{locale:string}>}){await requirePermission("marketplace.manage");const {locale}=await params;if(!isLocale(locale))notFound();const c=businessUi(locale);const t=toolsUi(locale);const rows=await db.select(listingColumns).from(marketplaceListings).orderBy(desc(marketplaceListings.createdAt)).limit(100);
 return <div className="tool-surface py-12"><div className="container-x max-w-5xl"><h1 className="mb-7 text-3xl">{c.moderate}</h1><Button asChild variant="neon"><Link href={`/${locale}/portal/listings/new?kind=product`}>{c.create}</Link></Button><div className="mt-8 space-y-5">{rows.map(row=><article key={row.id} className="tool-card rounded-2xl border p-6"><div className="flex flex-wrap justify-between gap-4"><h2 className="text-xl">{row.title}</h2><span>{row.kind} · {row.status}</span></div><p className="mt-4 whitespace-pre-wrap leading-7">{row.description}</p><p className="my-4">€{row.price} · {row.company} · {row.assetName}</p>{row.assetName&&<Button asChild variant="outline" className="mb-4"><a href={`/api/admin/products/${row.id}/download`}>{t.download}</a></Button>}<form action={moderateListingAction} className="grid gap-3 sm:grid-cols-2"><Input type="hidden" name="id" value={row.id}/><Button type="submit" name="status" value="approved" variant="neon" disabled={row.status==="approved"}>{c.publish}</Button><Button type="submit" name="status" value="rejected" variant="outline" disabled={row.status==="rejected"}>{c.reject}</Button></form></article>)}</div>{!rows.length&&<p className="mt-8">{t.empty}</p>}</div></div>;}
