import "server-only";
import {readBoundedText} from "../request-body";
export async function pageSpeed(url:string){
 const endpoint=new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");endpoint.searchParams.set("url",url);endpoint.searchParams.set("strategy","mobile");
 if(process.env.GOOGLE_PAGESPEED_API_KEY)endpoint.searchParams.set("key",process.env.GOOGLE_PAGESPEED_API_KEY);
 try{const response=await fetch(endpoint,{cache:"no-store",signal:AbortSignal.timeout(25000)});if(!response.ok)return null;
 const data=JSON.parse(await readBoundedText(response,5_000_000));const lighthouse=data.lighthouseResult;if(!lighthouse||lighthouse.runtimeError)return null;
 const score=lighthouse.categories?.performance?.score;const audits=lighthouse.audits;
 const metrics=["first-contentful-paint","largest-contentful-paint","total-blocking-time","cumulative-layout-shift","speed-index"].flatMap(id=>typeof audits?.[id]?.numericValue==="number"?[{id,value:audits[id].numericValue,unit:audits[id].numericUnit}]:[]);
 return {score:typeof score==="number"?Math.round(score*100):null,metrics,source:"Google Lighthouse",testedAt:lighthouse.fetchTime};
 }catch{return null;}
}
