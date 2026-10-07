import {notFound,redirect} from "next/navigation";
import {getViewer} from "@/lib/db/access";
import {isLocale} from "@/lib/i18n/config";
import {ListingForm} from "@/components/public/marketplace-forms";
import {listingKinds,type ListingKind} from "@/lib/marketplace";
import {businessUi} from "@/lib/i18n/business-ui";
export default async function Page({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{kind?:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const search=await searchParams;const kind=listingKinds.includes(search.kind as ListingKind)?search.kind as ListingKind:"job";const viewer=await getViewer();if(!viewer)redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/portal/listings/new?kind=${kind}`)}`);return <div className="tool-surface py-12"><div className="container-x max-w-3xl"><h1 className="mb-8 text-3xl">{businessUi(locale).create}</h1><ListingForm locale={locale} kind={kind} isOwner={viewer.isOwner}/></div></div>;}
