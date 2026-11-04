"use client";
import {useEffect,useSyncExternalStore} from "react";
import {usePathname} from "next/navigation";
import {adEligiblePath,hasCertifiedTcfConsent,type TcfConsentSnapshot} from "@/lib/advertising";

declare global {
 interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __tcfapi?: (
   command: string,
   version: number,
   callback: (tcData: TcfConsentSnapshot, success: boolean) => void,
   parameter?: number,
  ) => void;
  googlefc?: {
   callbackQueue?: Array<Record<string, () => void>>;
   showRevocationMessage?: () => void;
  };
 }
}

let tcfConsentGranted=false;
const listeners=new Set<()=>void>();
function notifyListeners(){for(const fn of listeners)fn();}

export function openCertifiedConsentManager():boolean{
 if(typeof window!=="undefined"&&typeof window.googlefc?.showRevocationMessage==="function"){
  window.googlefc.showRevocationMessage();
  return true;
 }
 return false;
}

function subscribeToRouteDom(onChange:()=>void){
 listeners.add(onChange);
 return()=>{listeners.delete(onChange);};
}

function getDomEligibilitySnapshot(){
 if(typeof document==="undefined"||typeof window==="undefined")return false;
 const hasPublisherContent=Boolean(document.querySelector('[data-ad-eligible-content="true"]'));
 return hasPublisherContent&&tcfConsentGranted;
}

function getServerEligibilitySnapshot(){return false;}

/** React 19 hoists async external scripts into head and deduplicates by src. */
export function AdSense({signedIn,publisher,enabled}:{signedIn:boolean;publisher:string;enabled:boolean}){
 const path=usePathname();
 const domVerified=useSyncExternalStore(subscribeToRouteDom,getDomEligibilitySnapshot,getServerEligibilitySnapshot);
 const routeEligible=enabled&&!signedIn&&adEligiblePath(path);
 const eligible=routeEligible&&domVerified;
 useEffect(()=>{
  if(typeof window!=="undefined"){
   window.dataLayer=window.dataLayer||[];
   window.gtag=window.gtag||function gtag(...args:unknown[]){window.dataLayer?.push(args);};
   window.googlefc=window.googlefc||{callbackQueue:[]};
   window.gtag("consent","default",{
    ad_storage:"denied",
    ad_user_data:"denied",
    ad_personalization:"denied",
    analytics_storage:"denied",
    wait_for_update:500,
   });
   window.gtag("set","ads_data_redaction",true);
   window.gtag("set","url_passthrough",false);
   if(typeof window.__tcfapi==="function"){
    window.__tcfapi("addEventListener",2,(tcData,success)=>{
     const next=hasCertifiedTcfConsent(tcData,success);
     if(tcfConsentGranted!==next){
      tcfConsentGranted=next;
      notifyListeners();
     }
    });
   }
  }
  function leaveAdDocument(event:MouseEvent){const target=event.target instanceof Element?event.target.closest("a"):null;if(!target||target.target==="_blank"||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!document.querySelector('script[data-blue-sass-adsense]'))return;
   const url=new URL(target.href,window.location.href);if(url.origin===window.location.origin&&!adEligiblePath(url.pathname)){event.preventDefault();event.stopImmediatePropagation();window.location.assign(url.href);}}
  document.addEventListener("click",leaveAdDocument,true);return()=>document.removeEventListener("click",leaveAdDocument,true);
 },[]);
 useEffect(()=>{if(!eligible&&document.querySelector('script[data-blue-sass-adsense]'))window.location.reload();},[eligible,path]);
 if(!eligible)return null;
 return <script async crossOrigin="anonymous" data-blue-sass-adsense="true" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}/>;
}
