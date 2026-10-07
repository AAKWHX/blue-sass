"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {adEligiblePath} from "@/lib/advertising";
/** React 19 hoists async external scripts into head and deduplicates by src. */
export function AdSense({signedIn,publisher,enabled}:{signedIn:boolean;publisher:string;enabled:boolean}){
 const path=usePathname();const eligible=enabled&&!signedIn&&adEligiblePath(path);
 useEffect(()=>{
  function leaveAdDocument(event:MouseEvent){const target=event.target instanceof Element?event.target.closest("a"):null;if(!target||target.target==="_blank"||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!document.querySelector('script[data-blue-sass-adsense]'))return;
   const url=new URL(target.href,window.location.href);if(url.origin===window.location.origin&&!adEligiblePath(url.pathname)){event.preventDefault();event.stopImmediatePropagation();window.location.assign(url.href);}}
  document.addEventListener("click",leaveAdDocument,true);return()=>document.removeEventListener("click",leaveAdDocument,true);
 },[]);
 useEffect(()=>{if(!eligible&&document.querySelector('script[data-blue-sass-adsense]'))window.location.reload();},[eligible,path]);
 if(!eligible)return null;
 return <script async crossOrigin="anonymous" data-blue-sass-adsense="true" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisher}`}/>;
}
