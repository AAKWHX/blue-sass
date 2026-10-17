import {pageMetadata} from "./page-metadata";
import type {Metadata} from "next";
import {isLocale} from "./i18n/config";
import {businessUi} from "./i18n/business-ui";
export function marketplaceMetadata(locale:string,path:"jobs"|"marketplace"|"products"):Metadata{
 if(!isLocale(locale))return{};const c=businessUi(locale);const title=path==="jobs"?c.jobs:path==="products"?c.products:c.freelance;
 return pageMetadata(locale,`/${path}`,`${title} | Blue Sass`,path==="jobs"?c.publicationNote:path==="products"?c.sellerNote:c.freelanceNote);
}
