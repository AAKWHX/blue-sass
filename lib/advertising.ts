import {isLocale} from "./i18n/config";
import {serviceSlugs} from "./service-catalog";

export const CONFIRMED_ADSENSE_PUBLISHER_ID="ca-pub-2458310650397376";
export const adsensePublisher=process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID?.trim()||CONFIRMED_ADSENSE_PUBLISHER_ID;
export const isAdsensePublisherVerified=adsensePublisher===CONFIRMED_ADSENSE_PUBLISHER_ID;
export const isAdsenseRuntimeEnabled=false;

const SUBSTANTIAL_SERVICE_PATHS=new Set<string>([...serviceSlugs]);

export type TcfConsentSnapshot={
 gdprApplies?:boolean;
 eventStatus?:string;
 purpose?:{consents?:Record<string,boolean>};
};

/**
 * Evaluates IAB TCF v2.2 consent data provided by a Google-certified CMP
 * (such as Google Privacy & Messaging / Funding Choices via __tcfapi).
 * Never assumes consent when TCF data is missing or incomplete.
 */
export function hasCertifiedTcfConsent(tcData:TcfConsentSnapshot|null|undefined,success:boolean):boolean{
 if(!success||!tcData||typeof tcData!=="object")return false;
 if(tcData.eventStatus!=="tcloaded"&&tcData.eventStatus!=="useractioncomplete")return false;
 if(tcData.gdprApplies===false)return true;
 if(tcData.gdprApplies===true)return tcData.purpose?.consents?.["1"]===true;
 return false;
}

/**
 * Conservative AdSense eligibility policy:
 * Only substantial, content-rich public service and architecture guides are eligible.
 * Never serve ads on login, register, admin, portal, payment, quote, contact forms,
 * legal pages, empty portfolio states, navigation hubs, or error/404 screens.
 */
export function adEligiblePath(path:string){
 if(typeof path!=="string"||!path.startsWith("/")||path.includes("?")||path.includes("#"))return false;
 const parts=path.split("/").filter(Boolean);
 if(parts.length!==3||!isLocale(parts[0]??""))return false;
 return parts[1]==="services"&&SUBSTANTIAL_SERVICE_PATHS.has(parts[2]??"");
}
