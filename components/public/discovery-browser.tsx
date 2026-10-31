"use client";
import {useState} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import type {ActiveLocale} from '@/lib/i18n/config';
import {discoveryCategories,discoverySites} from '@/lib/discovery/sites';
import {comparisons} from '@/lib/discovery/comparisons';
import {text,checkedAt} from '@/lib/discovery/types';
import './discovery-browser.css';
export const discoveryLabels={
 title:text('الويب، كما لم تتصفحه من قبل.','A different side of the web.','Een andere kant van het web.'),
 intro:text('عشرة مسارات لاكتشاف تجارب وأدوات وأفكار تستحق الزيارة. اختيارات تحريرية، وليست ترتيبًا حسب الشعبية أو جائزة تصميم.','Ten paths through experiences, tools and ideas worth exploring. Editorial selections, not a popularity ranking or a design award.','Tien routes langs ervaringen, tools en ideeën. Redactionele keuzes, geen populariteitsranglijst of ontwerpprijs.'),
 compare:text('قارن قبل أن تختار.','Compare before you choose.','Vergelijk voordat je kiest.'),
 compareIntro:text('24 خدمة، 12 مقارنة: الاستخدام المناسب، الميزات، الحدود، وأساس احتساب السعر.','24 services, 12 comparisons: use cases, capabilities, limits and billing units.','24 diensten, 12 vergelijkingen: toepassing, mogelijkheden, limieten en prijsbasis.'),
 search:text('ابحث باسم الموقع أو وصفه','Search site names and descriptions','Zoek op naam of beschrijving'),
 visit:text('زيارة الموقع','Visit website','Website bezoeken'),
 source:text('المصدر الرسمي','Official source','Officiële bron'),
 all:text('كل المسارات','All paths','Alle routes'),
 nothing:text('لا توجد نتائج. جرّب كلمة أخرى أو مسارًا مختلفًا.','No results. Try another term or path.','Geen resultaten. Probeer een andere term of route.'),
 count:text('موقعًا في هذا المسار','sites in this path','sites in deze route'),
 costNote:text('تكلفة البناء: حالات موثقة، وليست قائمة بأغلى 15 موقعًا عالميًا. الأرقام التاريخية تشمل نطاقات مختلفة كما هو موضح بكل بطاقة. منح التأسيس ليست تكلفة بناء؛ عندما لا يفصل المصدر تكلفة الموقع نذكر أنها غير منشورة.','Build costs: documented cases, not a world top-15 ranking. Historical figures cover different scopes, explained on each card. Establishment grants are not build costs; undisclosed website-only costs are marked explicitly.','Bouwkosten: gedocumenteerde casussen, geen mondiale top 15. Historische bedragen hebben verschillende scopes, toegelicht per kaart. Oprichtingsbijdragen zijn geen bouwkosten; ontbrekende afzonderlijke bouwkosten worden aangegeven.'),
 priceNote:text('مراجعة المصادر: 17 أكتوبر 2026. الأسعار المعروضة لا تُحوّل بين العملات؛ الضرائب والبلد ودورة الدفع والمقاعد والاستخدام قد تغيّر الإجمالي. الأرقام غير القابلة للتحقق موضحة، والمصدر الرسمي هو المرجع قبل الشراء.','Sources reviewed 17 October 2026. Quotes retain their currencies; tax, region, billing cycle, seats and usage affect totals. Unconfirmed numerical prices are marked; consult the official source before purchasing.','Bronnen bekeken op 17 oktober 2026. Geen valutaconversie; belasting, regio, betaaltermijn, gebruikers en verbruik bepalen het totaal. Niet bevestigde prijzen zijn gemarkeerd; raadpleeg de officiële bron voor aankoop.'),
 choice:text('كيف تختار؟','How to choose','Zo kies je'),
 browse:text('اكتشف المواقع','Explore websites','Ontdek websites'),
 comparisons:text('مقارنات الأدوات','Compare tools','Tools vergelijken'),
};
export function DiscoveryBrowser({locale}:{locale:ActiveLocale}){
 const [category,setCategory]=useState('unusual'),[query,setQuery]=useState('');const c=discoveryLabels;
 const matches=discoverySites.filter(site=>(category==='all'||site.category===category)&&`${site.name} ${site.description[locale]}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 return <div className="bs-discovery container-x">
  <div className="bs-discovery-heading"><h1>{c.title[locale]}</h1><p>{c.intro[locale]}</p><Link href={`/${locale}/compare`}>{c.comparisons[locale]}</Link></div>
  <label className="bs-discovery-search"><span>{c.search[locale]}</span><Input value={query} onChange={event=>setQuery(event.target.value)} type="search"/></label>
  <nav className="bs-discovery-filters" aria-label={c.all[locale]}>{[{id:'all',title:c.all},...discoveryCategories].map(item=><Button key={item.id} variant="unstyled" size="auto" aria-pressed={category===item.id} onClick={()=>setCategory(item.id)}>{item.title[locale]} <span>{item.id==='all'?discoverySites.length:discoverySites.filter(site=>site.category===item.id).length}</span></Button>)}</nav>
  {(category==='cost'||category==='all')&&<p className="bs-discovery-note">{c.costNote[locale]}</p>}
  <p role="status" aria-live="polite" className="bs-discovery-count">{matches.length} {c.count[locale]}</p>
  {matches.length===0&&<p className="bs-discovery-note">{c.nothing[locale]}</p>}
  <div className="bs-discovery-grid">{matches.map((site,index)=><article className="bs-discovery-card" key={site.id}>
   <span className="bs-discovery-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><p className="bs-discovery-category">{discoveryCategories.find(item=>item.id===site.category)?.title[locale]}</p>
   <h2 dir="auto">{site.name}</h2>{site.cost&&<p className="bs-discovery-price" dir="ltr">{site.cost}</p>}<p>{site.description[locale]}</p>{site.costScope&&<p className="bs-discovery-scope">{site.costScope[locale]}</p>}
   <div className="bs-discovery-card-links"><a href={site.url} target="_blank" rel="noopener noreferrer">{c.visit[locale]}<span className="sr-only"> — {site.name}</span></a>{site.source&&<a href={site.source} target="_blank" rel="noopener noreferrer">{c.source[locale]}</a>}</div>
  </article>)}</div>
 </div>;
}
export function ComparisonBrowser({locale}:{locale:ActiveLocale}){
 const [query,setQuery]=useState('');const c=discoveryLabels;const matches=comparisons.filter(pair=>`${pair.title[locale]} ${pair.providers.map(provider=>provider.name).join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <div className="bs-discovery container-x"><div className="bs-discovery-heading"><h1>{c.compare[locale]}</h1><p>{c.compareIntro[locale]}</p><Link href={`/${locale}/discover`}>{c.browse[locale]}</Link></div><p className="bs-discovery-note">{c.priceNote[locale]}</p>
 <label className="bs-discovery-search"><span>{c.search[locale]}</span><Input type="search" value={query} onChange={event=>setQuery(event.target.value)}/></label><p className="sr-only" role="status">{matches.length}</p>
 <nav className="bs-compare-index">{matches.map(pair=><a href={`#${pair.id}`} key={pair.id}>{pair.providers.map(provider=>provider.name).join(' / ')}</a>)}</nav>
 {matches.length===0&&<p>{c.nothing[locale]}</p>}{matches.map(pair=><section id={pair.id} key={pair.id} className="bs-comparison"><h2>{pair.title[locale]}</h2><div className="bs-comparison-pair">{pair.providers.map(provider=><article key={provider.name} className="bs-discovery-card"><h3 dir="auto">{provider.name}</h3><p className="bs-provider-price">{provider.price[locale]}</p><p>{provider.details[locale]}</p><a href={provider.source} target="_blank" rel="noopener noreferrer">{c.source[locale]}<span className="sr-only"> — {provider.name}</span></a></article>)}</div><div className="bs-comparison-decision"><h3>{c.choice[locale]}</h3><p>{pair.decision[locale]}</p></div><time dateTime={checkedAt}>{checkedAt}</time></section>)}</div>;
}
