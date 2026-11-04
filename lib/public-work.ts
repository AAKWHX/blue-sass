import type {ActiveLocale} from './i18n/config';
export type PublishedWork={id:string;title:Record<ActiveLocale,string>;description:Record<ActiveLocale,string>;image:string;video?:string;url?:string};
// Only owner-approved public media belongs here. No database or private project rows.
export const publishedWork:readonly PublishedWork[]=[];
export function validWork(item:PublishedWork){const local=(path:string)=>/^\/media\/work\/[a-zA-Z0-9/_-]+\.(?:webp|png|jpe?g|avif|mp4|webm)$/.test(path)&&!path.includes('..');if(!local(item.image)||!/\.(?:webp|png|jpe?g|avif)$/.test(item.image)||item.video&&(!local(item.video)||!/\.(?:mp4|webm)$/.test(item.video)))return false;if(item.url){try{const u=new URL(item.url);if(u.protocol!=='https:'||u.username||u.password)return false;}catch{return false;}}return true;}
