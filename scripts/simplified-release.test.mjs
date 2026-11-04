import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from './test-typescript-loader.mjs';
const { serviceSlugs, serviceCatalog }=load('lib/service-catalog.ts');
const { indexablePublicPaths }=load('lib/seo-public-paths.ts');
const { quoteReturnPath }=load('lib/auth/return-path.ts');
const { capabilityKeys }=load('lib/capabilities.ts');
const { homeFaqCopy }=load('lib/i18n/home-faq.ts');
test('retired templates, public work and previews expose no pages or administration',()=>{
 for(const dir of ['templates','previews','projects','motion-lab','motion-preview','admin/templates','admin/portfolio']){
  function walk(p){if(!fs.existsSync(p))return[];return fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(p+'/'+e.name):[p+'/'+e.name]);}
  assert.ok(!walk('app/[locale]/'+dir).some(f=>/page\.tsx$/.test(f)),dir);
 }
 assert.ok(!fs.existsSync('preview-site/package.json'));
 assert.ok(!capabilityKeys.includes('portfolio.manage'));
});
test('all eight service requests remain reachable without template choices',()=>{
 assert.deepEqual(serviceSlugs,['web','android','ios','windows','store','erp','ai','design']);
 for(const locale of ['ar','en','nl']){
  assert.equal(serviceCatalog(locale).length,8);
  for(const slug of serviceSlugs){assert.ok(indexablePublicPaths.includes('/services/'+slug));assert.equal(quoteReturnPath(`/${locale}/quote?service=${slug}&template=old-template`,locale),`/${locale}/quote?service=${slug}`);}
  const faq=homeFaqCopy(locale);assert.equal(faq.qs.length,faq.ans.length);assert.ok(faq.qs.length>=8);
 }
 assert.ok(!indexablePublicPaths.some(p=>/^\/(templates|projects|previews)(\/|$)/.test(p)));
});
test('homepage is independent of portfolio data, preview origin and blocking scene scripts',()=>{
 const page=fs.readFileSync('app/[locale]/page.tsx','utf8');
 assert.doesNotMatch(page,/portfolioEntries|publicMetrics|CinematicHome|template/);
 const home=fs.readFileSync('components/public/company-home.tsx','utf8');
 assert.doesNotMatch(home,/gsap|ScrollTrigger|iframe|PrismHero|video|template-preview/);
 for(const f of ['components/site-header.tsx','components/site-footer.tsx','components/public/studio-inquiry.tsx'])assert.doesNotMatch(fs.readFileSync(f,'utf8'),/\/templates|\/projects[`"/]|template-library|NEXT_PUBLIC_TEMPLATE_PREVIEW_ORIGIN/);
});

test('confirmed AdSense publisher ID ca-pub-2458310650397376 is configured and runtime stays disabled locally',()=>{
 const { CONFIRMED_ADSENSE_PUBLISHER_ID, adsensePublisher, isAdsensePublisherVerified, isAdsenseRuntimeEnabled, adEligiblePath }=load('lib/advertising.ts');
 assert.equal(CONFIRMED_ADSENSE_PUBLISHER_ID,'ca-pub-2458310650397376');
 assert.equal(adsensePublisher,'ca-pub-2458310650397376');
 assert.equal(isAdsensePublisherVerified,true);
 assert.equal(isAdsenseRuntimeEnabled,false);
 assert.equal(fs.readFileSync('public/ads.txt','utf8').trim(),'google.com, pub-2458310650397376, DIRECT, f08c47fec0942fa0');
 assert.doesNotMatch(fs.readFileSync('lib/advertising.ts','utf8'),/5102658784699421/);
 assert.doesNotMatch(fs.readFileSync('public/ads.txt','utf8'),/5102658784699421/);
 assert.equal(adEligiblePath('/en/services/web'),true);
 assert.equal(adEligiblePath('/en/login'),false);
 assert.equal(adEligiblePath('/en/contact'),false);
});

test('IAB TCF v2.2 & Google Privacy & Messaging consent signals fail closed and never use custom window flags',()=>{
 const { hasCertifiedTcfConsent, adEligiblePath }=load('lib/advertising.ts');
 const adsenseSource=fs.readFileSync('components/adsense.tsx','utf8');
 assert.doesNotMatch(adsenseSource,/__blueSassAdConsentGranted/);
 const cmpSource=fs.readFileSync('public/cmp-bootstrap.js','utf8');
 assert.match(cmpSource,/__tcfapi/);
 assert.match(cmpSource,/googlefc/);
 assert.doesNotMatch(adsenseSource,/adsbygoogle|pagead2|<script/);
 assert.equal(hasCertifiedTcfConsent(null,true),false);
 assert.equal(hasCertifiedTcfConsent({gdprApplies:true,eventStatus:'tcloaded',purpose:{consents:{'1':false}}},true),false);
 assert.equal(hasCertifiedTcfConsent({gdprApplies:true,eventStatus:'cmpuishown',purpose:{consents:{'1':true}}},true),false);
 assert.equal(hasCertifiedTcfConsent({gdprApplies:true,eventStatus:'tcloaded',purpose:{consents:{'1':true}}},true),true);
 assert.equal(hasCertifiedTcfConsent({gdprApplies:true,eventStatus:'useractioncomplete',purpose:{consents:{'1':true}}},true),true);
 assert.equal(hasCertifiedTcfConsent({gdprApplies:false,eventStatus:'tcloaded'},true),true);
 assert.equal(hasCertifiedTcfConsent({gdprApplies:true,eventStatus:'tcloaded',purpose:{consents:{'1':true}}},false),false);
 for(const p of ['/en/services/company','/ar/services/apps','/nl/services/systems','/en/services','/en/work','/en/privacy','/en/terms'])assert.equal(adEligiblePath(p),false,p);
});

test('contact inquiry validation and mailto fallback cover ar, en, and nl without live external calls',()=>{
 const { inquirySchema, buildInquiryMailtoUrl }=load('lib/validation/inquiry.ts');
 for(const locale of ['ar','en','nl']){
  const valid=inquirySchema.safeParse({name:'Test Visitor',email:'visitor@example.com',company:'Blue Test',projectType:'web',budget:'1000to5000',message:'We need a multilingual corporate website with RTL support.',locale,website:''});
  assert.equal(valid.success,true,locale);
  const mailto=buildInquiryMailtoUrl(valid.data);
  assert.ok(mailto.startsWith('mailto:help@bluesass.nl?subject='),mailto);
  assert.match(decodeURIComponent(mailto),/visitor@example\.com/);
 }
 assert.equal(inquirySchema.safeParse({name:'A',email:'bad',message:'short',projectType:'web',locale:'en',website:''}).success,false);
 assert.equal(inquirySchema.safeParse({name:'Test Visitor',email:'visitor@example.com',projectType:'web',message:'Valid length message here for test.',locale:'en',website:'spam.example'}).success,false);
});

test('production headers and robots configuration separate public release from QA preview',async()=>{
 const config=(await import('../next.config.mjs')).default;
 const headers=await config.headers();
 const rootHeaders=headers.find(h=>h.source==='/(.*)').headers;
 assert.ok(!rootHeaders.some(h=>h.key==='X-Robots-Tag'));
 assert.ok(rootHeaders.some(h=>h.key==='Strict-Transport-Security'));
 const csp=rootHeaders.find(h=>h.key==='Content-Security-Policy').value;
 assert.doesNotMatch(csp,/unsafe-eval|127\.0\.0\.1:3199/);
 assert.match(csp,/upgrade-insecure-requests/);
 const robots=load('app/robots.ts').default();
 assert.equal(robots.rules.allow,'/');
 assert.ok(Array.isArray(robots.rules.disallow)&&robots.rules.disallow.includes('/api/'));
 assert.equal(robots.sitemap,'https://www.bluesass.nl/sitemap.xml');
});

test('email-only contact configuration uses localized mailto:help@bluesass.nl and disables /api/inquiries server-side',()=>{
 const { localizedContactMailto, PRIMARY_CONTACT_EMAIL }=load('lib/validation/inquiry.ts');
 const { isTemporarilyDisabledPath, publicFeatureFlags }=load('lib/capabilities.ts');
 assert.equal(PRIMARY_CONTACT_EMAIL,'help@bluesass.nl');
 assert.equal(publicFeatureFlags.inquiries,false);
 assert.equal(isTemporarilyDisabledPath('/api/inquiries'),true);
 const subjects=new Set();
 for(const locale of ['ar','en','nl']){
  const href=localizedContactMailto(locale);
  assert.ok(href.startsWith('mailto:help@bluesass.nl?subject='),href);
  subjects.add(href);
 }
 assert.equal(subjects.size,3,'distinct localized subjects for ar, en, nl');
 const studioInquirySource=fs.readFileSync('components/public/studio-inquiry.tsx','utf8');
 assert.doesNotMatch(studioInquirySource,/\/api\/inquiries|fetch\(/);
 assert.match(studioInquirySource,/localizedContactMailto/);
});
