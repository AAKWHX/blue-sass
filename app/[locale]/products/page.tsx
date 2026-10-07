import {notFound} from "next/navigation";
import {isLocale} from "@/lib/i18n/config";
import {MarketplacePage} from "@/components/public/marketplace-page";
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){return marketplaceMetadata((await params).locale,"products");}
import {marketplaceMetadata} from "@/lib/marketplace-metadata";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <MarketplacePage locale={locale} kind="product"/>;}
