import {readFile,mkdir,writeFile} from 'node:fs/promises';
const files=['lib/discovery/sites.ts','lib/discovery/costs.ts','lib/discovery/comparisons.ts'];
const sources=await Promise.all(files.map(file=>readFile(file,'utf8')));
const filter=process.argv[2]?new RegExp(process.argv[2]):null;
const urls=[...new Set(sources.flatMap(source=>[...source.matchAll(/https:\/\/[^'"\s`|]+/g)].map(match=>match[0])).filter(url=>!url.includes('${')&&(!filter||filter.test(url))))];
let cursor=0;const results=[];
await Promise.all(Array.from({length:12},async()=>{while(cursor<urls.length){const url=urls[cursor++];try{const response=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{'User-Agent':'BlueSass-LinkReview/1.0'},redirect:'follow'});const html=await response.text();results.push({url,status:response.status,finalUrl:response.url,title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g,' ').slice(0,140)||null});}catch(error){results.push({url,error:error.message});}}}));
await mkdir('artifacts/discovery',{recursive:true});await writeFile(`artifacts/discovery/link-review${filter?'-updated':''}.json`,JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
console.log(JSON.stringify({total:results.length,ok:results.filter(row=>row.status>=200&&row.status<400).length,attention:results.filter(row=>!row.status||row.status>=400)},null,2));
