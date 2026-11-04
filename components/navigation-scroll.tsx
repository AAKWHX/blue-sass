"use client";
import {useEffect,useLayoutEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
export function NavigationScroll(){
 const pathname=usePathname(),frames=useRef<number[]>([]);
 useEffect(()=>{const previous=history.scrollRestoration;history.scrollRestoration='manual';const top=()=>{if(!location.hash)window.scrollTo({top:0,left:0,behavior:'instant'});};addEventListener('pageshow',top);top();return()=>{history.scrollRestoration=previous;removeEventListener('pageshow',top);frames.current.forEach(cancelAnimationFrame);};},[]);
 useLayoutEffect(()=>{frames.current.forEach(cancelAnimationFrame);frames.current=[];if(location.hash)return;const top=()=>window.scrollTo({top:0,left:0,behavior:'instant'});top();frames.current.push(requestAnimationFrame(()=>{top();frames.current.push(requestAnimationFrame(top));}));},[pathname]);
 return null;
}
