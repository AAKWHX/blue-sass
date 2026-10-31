import Link from 'next/link';
import type {CSSProperties} from 'react';
import type {ActiveLocale} from '@/lib/i18n/config';
import {PenTool,Triangle,Cloud,Code,Orbit,Sparkles,Shapes,Radio} from 'lucide-react';
const badges=[
 {name:'Figma',Icon:Shapes,color:'#e6a678',path:'compare#figma-penpot'},
 {name:'Penpot',Icon:PenTool,color:'#a6dfc1',path:'compare#figma-penpot'},
 {name:'Vercel',Icon:Triangle,color:'#e7edf4',path:'compare#vercel-render'},
 {name:'Render',Icon:Cloud,color:'#b8b2f5',path:'compare#vercel-render'},
 {name:'Claude',Icon:Sparkles,color:'#e5ac86',path:'compare#claude-codex'},
 {name:'Codex',Icon:Code,color:'#a2ded1',path:'compare#claude-codex'},
 {name:'NASA Eyes',Icon:Orbit,color:'#8cc9ef',path:'discover'},
 {name:'Radio Garden',Icon:Radio,color:'#d3df9e',path:'discover'},
];
/** Original thematic symbols; product names identify the linked directory entries. */
export function DiscoveryOrbit({locale}:{locale:ActiveLocale}){return <div className="bs-discovery-badges">{badges.map(({name,Icon,color,path})=><Link key={name} href={`/${locale}/${path}`} style={{'--badge-color':color} as CSSProperties}><Icon aria-hidden="true"/><span dir="ltr">{name}</span></Link>)}</div>;}
