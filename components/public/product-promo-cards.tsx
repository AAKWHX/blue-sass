import Link from "next/link";
import {Cloud,FileSearch,Layers3,Briefcase,ShoppingBag,Users} from "lucide-react";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {messageToolCopy} from "@/lib/i18n/message-tool";
import {platformCopy} from "@/lib/i18n/platform-tools";
import {businessUi} from "@/lib/i18n/business-ui";
import {subscriptionUnits,subscriptionHeading} from "@/lib/i18n/subscription-units";

import type {Locale} from "@/lib/i18n/config";
export function ProductPromoCards({locale}:{locale:Locale}){const c=toolsUi(locale);const p=platformCopy(locale);const b=businessUi(locale);
 const cards=[{path:"subscriptions",title:subscriptionHeading(locale),detail:p.plansIntro,icon:Layers3},{path:"hosting",title:subscriptionUnits(locale).hosting,detail:"Static · Next.js",icon:Cloud},{path:"tools",title:messageToolCopy(locale).tools,detail:c.heading,icon:FileSearch}];
 return <section className="section-y"><div className="container-x"><div className="grid gap-5 lg:grid-cols-3">{cards.map(card=><Link key={card.path} href={`/${locale}/${card.path}`} className="gold-product-card group rounded-3xl border p-7 sm:p-9"><card.icon className="size-8"/><h2 className="mt-7 text-2xl font-semibold leading-9">{card.title}</h2><p className="mt-4 text-sm leading-7 text-white/75">{card.detail}</p><span className="mt-7 inline-block border-b border-current/40 pb-1 text-sm">{c.open}</span></Link>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-3">{[{path:"jobs",title:b.jobs,icon:Briefcase},{path:"marketplace",title:b.freelance,icon:Users},{path:"products",title:b.products,icon:ShoppingBag}].map(card=><Link key={card.path} href={`/${locale}/${card.path}`} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.03] p-5 text-white transition-colors hover:border-white/40"><card.icon className="size-5 shrink-0"/><h2 className="text-base font-semibold">{card.title}</h2></Link>)}</div></div></section>;
}
