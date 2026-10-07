import Link from "next/link";
import {notFound} from "next/navigation";
import {z} from "zod";
import {getViewer} from "@/lib/db/access";
import {visibleListing,listingOffers} from "@/lib/db/marketplace";
import {isLocale} from "@/lib/i18n/config";
import {businessUi} from "@/lib/i18n/business-ui";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {OfferForm} from "@/components/public/marketplace-forms";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {buyProductAction} from "@/app/actions/marketplace";
export const metadata={title:"Blue Sass — Listing details",robots:{index:false,follow:true}};
export default async function Page({params}:{params:Promise<{locale:string;id:string}>}){const {locale,id}=await params;if(!isLocale(locale)||!z.string().uuid().safeParse(id).success)notFound();const viewer=await getViewer();const row=await visibleListing(id,viewer?.id);if(!row)notFound();const c=businessUi(locale);const t=toolsUi(locale);const offers=viewer?await listingOffers(id,viewer.id):[];
 return <div className="tool-surface py-12"><div className="container-x max-w-4xl"><p className="text-sm text-white/65">{row.category} · {row.company} {row.location}</p><h1 className="mt-4 text-3xl font-semibold sm:text-5xl">{row.title}</h1><p className="my-8 whitespace-pre-wrap text-base leading-8 text-white/85">{row.description}</p>{row.kind!=="job"&&<p className="mb-6 text-3xl">€{row.price}</p>}
 {viewer&&row.platformProduct?<form action={buyProductAction}><Input type="hidden" name="id" value={id}/><Input type="hidden" name="locale" value={locale}/><Button type="submit" variant="neon">{c.buy}</Button></form>:viewer&&row.userId!==viewer.id?<OfferForm locale={locale} listingId={id} job={row.kind==="job"}/>:!viewer?<Button asChild variant="neon"><Link href={`/${locale}/login?next=${encodeURIComponent(`/${locale}/listings/${id}`)}`}>{t.account}</Link></Button>:null}
 {offers.length>0&&<section className="mt-10"><h2 className="mb-5 text-2xl">{c.offers}</h2><div className="space-y-4">{offers.map(offer=><article key={offer.id} className="tool-card rounded-xl border p-5"><h3 className="font-semibold">{offer.name} · €{offer.amount}</h3><p className="mt-3 whitespace-pre-wrap leading-7">{offer.message}</p><a className="mt-3 block break-all underline" href={`mailto:${offer.email}`}>{offer.email}</a></article>)}</div></section>}
 </div></div>;}
