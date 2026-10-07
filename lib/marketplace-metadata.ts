import type {Metadata} from "next";
import {isLocale,locales} from "./i18n/config";
import {businessUi} from "./i18n/business-ui";
export function marketplaceMetadata(locale:string,path:"jobs"|"marketplace"|"products"):Metadata{
 if(!isLocale(locale))return{};const c=businessUi(locale);const title=path==="jobs"?c.jobs:path==="products"?c.products:c.freelance;
 return {title:`${title} | Blue Sass`,description:path==="jobs"?c.publicationNote:path==="products"?c.sellerNote:c.freelanceNote,alternates:{canonical:`/${locale}/${path}`,languages:Object.fromEntries(locales.map(value=>[value,`/${value}/${path}`]))},openGraph:{title,url:`/${locale}/${path}`}};
}
