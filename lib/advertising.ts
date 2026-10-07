import {isLocale} from "./i18n/config";
export const adsensePublisher=process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID??"ca-pub-2458310650397376";
export function adEligiblePath(path:string){
 const parts=path.split("/").filter(Boolean);if(!isLocale(parts[0]??""))return false;
 if(["blog","academy"].includes(parts[1]))return true;
 // Tool forms can contain Wi-Fi credentials, contact details or private URLs.
 // Monetize the directory and editorial content, not the forms/results.
 return parts[1]==="tools"&&parts.length===2;
}
