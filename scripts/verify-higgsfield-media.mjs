import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { motionChromium } from './motion-browser-runtime.mjs';
const out='artifacts/higgsfield-production';await mkdir(`${out}/screenshots`,{recursive:true});
const results={layouts:[],checks:[],video:{},errors:[]};
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const go=async(page,route)=>{const r=await page.goto('http://localhost:3000'+route,{waitUntil:'domcontentloaded',timeout:60000});assert.equal(r.status(),200);await page.locator('main').waitFor();await page.evaluate(()=>document.fonts.ready);};
const listen=page=>page.on('pageerror',e=>results.errors.push({url:page.url(),message:e.message}));
try{
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();listen(page);
 await go(page,'/ar');await page.locator('.cinema-home[data-scroll-motion=true]').waitFor({state:'attached'});await page.waitForFunction(()=>document.querySelector('video')?.dataset.playing==='true');
 results.video=await page.locator('video').evaluate(v=>({source:v.currentSrc,muted:v.muted,loop:v.loop,width:v.videoWidth,height:v.videoHeight,time:v.currentTime,readyState:v.readyState}));assert.ok(results.video.source.endsWith('.webm'));assert.ok(results.video.muted&&results.video.loop&&results.video.readyState>=2);
 await page.evaluate(()=>{window.mediaLoopSamples=[];const v=document.querySelector('video');v.addEventListener('timeupdate',()=>window.mediaLoopSamples.push(v.currentTime));});
 await page.waitForTimeout(11500);const samples=await page.evaluate(()=>window.mediaLoopSamples);assert.ok(samples.some((t,i)=>i>0&&t<samples[i-1]-2),'Video must actually wrap to its beginning');results.video.loopObserved=true;results.checks.push('Desktop: actual VP9 decode, muted autoplay and video loop confirmed');
 await page.screenshot({path:`${out}/screenshots/hero-desktop.jpg`,quality:88});
 await page.getByRole('button',{name:'إيقاف الحركة',exact:true}).click();await page.locator('.cinema-home[data-paused=true]').waitFor({state:'attached'});assert.equal(await page.locator('video').count(),0);results.checks.push('Pause control removes active video and retains the poster');
 await page.waitForFunction(()=>document.querySelector('.cinema-motion-control')?.getAttribute('data-pressed')!=='true');await page.getByRole('button',{name:'تشغيل الحركة',exact:true}).press('Enter');await page.waitForFunction(()=>document.querySelector('video')?.dataset.playing==='true');
 await page.locator('#home-hosting').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!document.querySelector('video'));results.checks.push('Offscreen hero releases video');await page.evaluate(()=>scrollTo(0,0));await page.waitForFunction(()=>document.querySelector('video')?.dataset.playing==='true');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.querySelector('video'));assert.notEqual(await page.locator('.cinema-story-sticky').evaluate(e=>getComputedStyle(e).position),'sticky');await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.querySelector('video')?.dataset.playing==='true');results.checks.push('Changing reduced motion live disables video and pinning; restoring it enables the enhancement');
 for(const id of ['studio-services','portfolio','home-tools','home-products','home-subscriptions','home-hosting','home-careers']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(900);await page.screenshot({path:`${out}/screenshots/${id}-desktop.jpg`,quality:85});}
 await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(350);await page.screenshot({path:`${out}/screenshots/footer-desktop.jpg`,quality:85});await context.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const phone=await mobile.newPage();listen(phone);const mobileVideos=[];phone.on('request',r=>{if(/hero-titanium-v1\.(mp4|webm)/.test(r.url()))mobileVideos.push(r.url());});await go(phone,'/ar');await phone.locator('.cinema-home[data-enhanced=mobile]').waitFor({state:'attached'});await phone.waitForTimeout(1000);assert.equal(await phone.locator('video').count(),0);assert.equal(mobileVideos.length,0);await phone.screenshot({path:`${out}/screenshots/hero-mobile.jpg`,quality:88});
 await phone.locator('#home-tools').scrollIntoViewIfNeeded();await phone.waitForTimeout(700);assert.ok(await phone.locator('.cinema-section[data-revealed=true]').count()>0);await phone.screenshot({path:`${out}/screenshots/tools-mobile.jpg`,quality:85});await phone.emulateMedia({reducedMotion:'reduce'});await phone.waitForFunction(()=>!document.querySelector('[data-revealed]'));assert.equal(await phone.locator('video').count(),0);results.checks.push('Mobile: zero video requests, static poster, section entrances, and live reduced-motion cleanup');await mobile.close();
 for(const mode of ['reduce','save-data']){
  const c=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:mode==='reduce'?'reduce':'no-preference'});
  if(mode==='save-data')await c.addInitScript(()=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:true,effectiveType:'4g',addEventListener(){},removeEventListener(){}}}));
  const p=await c.newPage();listen(p);const requests=[];p.on('request',r=>{if(/hero-titanium-v1\.(mp4|webm)/.test(r.url()))requests.push(r.url());});await go(p,'/ar');await p.waitForTimeout(900);assert.equal(await p.locator('video').count(),0);assert.equal(requests.length,0);results.checks.push(`${mode}: zero video requests from initial page load`);await c.close();
 }
 const c=await browser.newContext({reducedMotion:'reduce'}),p=await c.newPage();listen(p);
 for(const width of [375,390,768,1440,1920])for(const locale of ['ar','en','nl']){
  await p.setViewportSize({width,height:width<600?844:1000});await go(p,'/'+locale);const state=await p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,dir:document.documentElement.dir,h1:document.querySelectorAll('h1').length}));assert.ok(state.scrollWidth<=width);assert.equal(state.h1,1);assert.equal(state.dir,locale==='ar'?'rtl':'ltr');results.layouts.push({locale,width,...state});
 }
 for(const route of ['services/web','about','contact','tools'])for(const width of [375,1440]){await p.setViewportSize({width,height:900});await go(p,'/ar/'+route);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));results.layouts.push({route,width});}
 await c.close();assert.equal(results.errors.length,0,JSON.stringify(results.errors));
}finally{await browser.close();await writeFile(`${out}/browser-results.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify({checks:results.checks,layouts:results.layouts.length,errors:results.errors,video:results.video},null,2));
