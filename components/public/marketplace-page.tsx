import Link from "next/link";
import {Button} from "@/components/ui/button";
import {publicListings} from "@/lib/db/marketplace";
import {businessUi} from "@/lib/i18n/business-ui";
import {toolsUi} from "@/lib/i18n/tools-ui";
import type {Locale} from "@/lib/i18n/config";
import {jobTiers,type JobTier,type ListingKind} from "@/lib/marketplace";
export async function MarketplacePage({locale,kind}:{locale:Locale;kind:ListingKind}){const c=businessUi(locale);const t=toolsUi(locale);const rows=await publicListings(kind);const title=kind==="job"?c.jobs:kind==="project"?c.freelance:c.products;
 return <div className="tool-surface py-12 sm:py-20"><div className="container-x max-w-6xl"><div className="flex flex-wrap items-center justify-between gap-5"><h1 className="text-3xl font-semibold sm:text-5xl">{title}</h1><Button asChild variant="neon"><Link href={`/${locale}/portal/listings/new?kind=${kind}`}>{c.create}</Link></Button></div><p className="mt-5 max-w-3xl text-sm leading-7 text-white/70">{kind==="job"?c.publicationNote:kind==="product"?c.sellerNote:c.freelanceNote}</p>
 {kind==="job"&&<div className="my-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(jobTiers).map(([id,tier])=><div key={id} className={`${id==="basic"?"tool-card":"gold-product-card"} rounded-2xl border p-5`}><h2 className="text-lg font-semibold">{tier.label}</h2><p className="mt-2 text-3xl">€{tier.price}</p><p className="mt-2 text-xs text-white/75">{c.duration}</p><p className="mt-2 text-sm">{id==="basic"?c.published:`${t.status} ${tier.rank+1}`}</p></div>)}</div>}
 <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rows.map(row=><Link key={row.id} href={`/${locale}/listings/${row.id}`} className={`${row.kind==="job"&&row.tier!=="basic"?"gold-product-card":"tool-card"} rounded-2xl border p-6 transition-colors hover:border-white/50`}><p className="text-xs text-white/65">{row.category}{row.kind==="job"?` · ${jobTiers[row.tier as JobTier]?.label??"Basic"}`:""}</p><h2 className="mt-3 text-xl font-semibold leading-8">{row.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-7 text-white/75">{row.description}</p>{row.company&&<p className="mt-3 text-sm">{row.company} · {row.location}</p>}{row.kind!=="job"&&<p className="mt-4 text-xl">€{row.price}</p>}</Link>)}</div>{!rows.length&&<p className="my-10 rounded-xl border border-white/15 p-8">{t.empty}</p>}
 </div></div>;
}
