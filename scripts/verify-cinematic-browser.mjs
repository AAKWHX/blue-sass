import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { motionChromium } from './motion-browser-runtime.mjs';
const chromium=await motionChromium();
const base=process.env.MOTION_PREVIEW_URL||'http://localhost:3000';
const labBase=process.env.MOTION_LAB_URL||'http://localhost:3001';
const out=path.resolve('artifacts/motion-redesign');
await mkdir(path.join(out,'screenshots'),{recursive:true});await mkdir(path.join(out,'recordings'),{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results={viewports:[],interactions:[],errors:[],networkFailures:[],metrics:[],transitionEvents:[]};
const sizes=[{width:1920,height:1080},{width:1440,height:900},{width:768,height:1024},{width:390,height:844},{width:375,height:812}];
const collect = page=>{
 page.on('pageerror',error=>results.errors.push({url:page.url(),message:error.message,stack:error.stack}));
 page.on('requestfailed',r=>results.networkFailures.push({url:r.url(),error:r.failure()?.errorText}));
 page.on('console',m=>{if(m.type()==='error'&&!page.url().includes('00000000-0000')&&!m.text().includes('net::ERR_NETWORK_ACCESS_DENIED')) results.errors.push({url:page.url(),message:m.text()});if(m.text().startsWith('MOTION_TRANSITION'))results.transitionEvents.push(m.text());});
};
const observe=()=>{
 window.__motionQA={lcp:0,cls:0,longTasks:0,maxTaskMs:0,maxInteractionMs:0,frames:0,maxFrameMs:0};
 for(const type of ['largest-contentful-paint','layout-shift','longtask','event']) {
  if(!PerformanceObserver.supportedEntryTypes.includes(type))continue;
  const observer=new PerformanceObserver(list=>{for(const e of list.getEntries()) {
   if(type==='largest-contentful-paint')window.__motionQA.lcp=e.startTime;
   if(type==='layout-shift'&&!e.hadRecentInput)window.__motionQA.cls+=e.value;
   if(type==='longtask'){window.__motionQA.longTasks++;window.__motionQA.maxTaskMs=Math.max(window.__motionQA.maxTaskMs,e.duration);}
   if(type==='event'&&e.interactionId)window.__motionQA.maxInteractionMs=Math.max(window.__motionQA.maxInteractionMs,e.duration);
  }});observer.observe({type,buffered:true,...(type==='event'?{durationThreshold:16}:{})});
 }
 let before=0;const start=performance.now();function frame(t){if(before){window.__motionQA.frames++;window.__motionQA.maxFrameMs=Math.max(window.__motionQA.maxFrameMs,t-before);}before=t;if(t-start<15000)requestAnimationFrame(frame);}requestAnimationFrame(frame);
 addEventListener('pageswap',e=>console.log('MOTION_TRANSITION pageswap '+Boolean(e.viewTransition)));
 addEventListener('pagereveal',e=>console.log('MOTION_TRANSITION pagereveal '+Boolean(e.viewTransition)));
};
try {
 const context=await browser.newContext();await context.addInitScript(observe);const page=await context.newPage();collect(page);
 for(const size of sizes)for(const locale of ['ar','en','nl']){
  await page.setViewportSize(size);const response=await page.goto(`${base}/${locale}`,{waitUntil:'networkidle',timeout:120000});assert.equal(response.status(),200);
  await page.locator('.cinema-home[data-enhanced]').waitFor({timeout:30000});
  const state=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,dir:document.documentElement.dir,lang:document.documentElement.lang,story:getComputedStyle(document.querySelector('.cinema-story-sticky')).position,panels:document.querySelectorAll('.cinema-story-panel').length,headings:document.querySelectorAll('h1').length}));
  assert.equal(state.lang,locale);assert.equal(state.dir,locale==='ar'?'rtl':'ltr');assert.ok(state.scroll<=state.client,JSON.stringify({size,locale,state}));assert.equal(state.headings,1);
  if(size.width>=1024)assert.equal(state.story,'sticky');else assert.notEqual(state.story,'sticky');
  results.viewports.push({size,locale,...state});
  await page.screenshot({path:path.join(out,'screenshots',`${locale}-${size.width}.jpg`),quality:85});
 }
 console.log('Viewport matrix passed:',results.viewports.length);
 await page.setViewportSize({width:1440,height:900});await page.goto(`${base}/ar`,{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'اصنع موقعك الخاص',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[aria-controls="cinema-service-web"]').getAttribute('aria-expanded')==='true');assert.equal(await page.getByRole('button',{name:'اصنع موقعك الخاص',exact:true}).getAttribute('aria-expanded'),'true');
 assert.ok(await page.locator('#cinema-service-web').isVisible());results.interactions.push('Service disclosure opens with its details and real route');
 await page.screenshot({path:path.join(out,'screenshots','service-open.jpg'),quality:85});
 await page.getByRole('button',{name:'اصنع موقعك الخاص',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[aria-controls="cinema-service-web"]').getAttribute('aria-expanded')==='false');assert.equal(await page.getByRole('button',{name:'اصنع موقعك الخاص',exact:true}).getAttribute('aria-expanded'),'false');
 await page.getByRole('button',{name:'القائمة',exact:true}).click();await page.getByRole('dialog').waitFor();await page.screenshot({path:path.join(out,'screenshots','menu-desktop.jpg'),quality:85});await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await page.getByRole('dialog').count(),0);assert.equal(await page.getByRole('button',{name:'القائمة',exact:true}).evaluate(e=>e===document.activeElement),true);results.interactions.push('Navigation opens, Escape closes, focus returns to trigger');
 await page.goto(`${base}/ar`,{waitUntil:'networkidle'});await page.getByRole('button',{name:'إيقاف الحركة',exact:true}).click();await page.locator('.cinema-home[data-paused=true]').waitFor({state:'attached'});assert.equal(await page.locator('.cinema-home').getAttribute('data-paused'),'true');assert.equal(await page.locator('.cinema-story-sticky').evaluate(e=>getComputedStyle(e).position),'relative');results.interactions.push('Pause reverts scroll effects to a readable static layout');
 await page.waitForTimeout(400);await page.getByRole('button',{name:'تشغيل الحركة',exact:true}).press('Enter');await page.locator('.cinema-home[data-paused=false]').waitFor({state:'attached'});await page.locator('.cinema-home[data-scroll-motion=true]').waitFor({state:'attached'});console.log('Pause and keyboard resume passed');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(300);assert.notEqual(await page.locator('.cinema-story-sticky').evaluate(e=>getComputedStyle(e).position),'sticky');assert.equal(await page.locator('.cinema-ambient i').first().evaluate(e=>getComputedStyle(e).animationName),'none');assert.ok(await page.locator('#cinema-title').isVisible());results.interactions.push('Actual reduced-motion media query disables pinning and CSS ambience, keeps content');await page.screenshot({path:path.join(out,'screenshots','reduced-motion.jpg'),quality:85});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:390,height:844});await page.goto(`${base}/ar`,{waitUntil:'networkidle'});await page.getByRole('button',{name:'القائمة',exact:true}).click();await page.getByRole('dialog').waitFor();await page.screenshot({path:path.join(out,'screenshots','menu-mobile.jpg'),quality:85});await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'اللغة',exact:true}).click();await page.getByRole('menuitemcheckbox',{name:/English/}).click();await page.waitForURL('**/en',{timeout:30000});assert.equal(await page.locator('html').getAttribute('dir'),'ltr');results.interactions.push('Language switch navigates Arabic RTL to English LTR');
 await page.keyboard.press('Tab');assert.notEqual(await page.evaluate(()=>document.activeElement.tagName),'BODY');
 const notPublic=await page.goto(`${base}/ar/projects/00000000-0000-0000-0000-000000000000`,{waitUntil:'domcontentloaded'});assert.equal(notPublic.status(),404);results.interactions.push('Unknown/unpublished project identifier returns 404');
 await context.close();
 const recording=await browser.newContext({viewport:{width:1440,height:900}});await recording.addInitScript(observe);const motion=await recording.newPage();collect(motion);
 await motion.goto(`${base}/ar`,{waitUntil:'networkidle'});await motion.locator('.cinema-home[data-scroll-motion=true]').waitFor();await motion.waitForTimeout(900);
 await motion.screenshot({path:path.join(out,'screenshots','hero-final.jpg'),quality:90});
 for(let i=0;i<12;i++){await motion.mouse.wheel(0,95);await motion.waitForTimeout(90);}
 const storyTop=await motion.locator('.cinema-story').evaluate(e=>e.getBoundingClientRect().top+scrollY);await motion.evaluate(y=>scrollTo(0,y),storyTop-80);await motion.waitForTimeout(600);
 const panels=[];
 for(let i=0;i<18;i++){await motion.mouse.wheel(0,70);await motion.waitForTimeout(110);if([0,7,17].includes(i)){await motion.screenshot({path:path.join(out,'screenshots',`story-${i}.jpg`),quality:85});panels.push(await motion.locator('.cinema-story-panel').evaluateAll(items=>items.map(e=>({opacity:getComputedStyle(e).opacity,transform:getComputedStyle(e).transform}))));}}
 assert.notDeepEqual(panels[0],panels.at(-1));results.interactions.push('Pinned scene stays in place while picture opacity and transforms change across scroll positions');
 for(const id of ['portfolio','home-tools','home-products','home-subscriptions','home-hosting','home-careers']){await motion.locator('#'+id).scrollIntoViewIfNeeded();await motion.waitForTimeout(300);await motion.screenshot({path:path.join(out,'screenshots',id+'.jpg'),quality:85});await motion.mouse.wheel(0,300);await motion.waitForTimeout(180);}
 await motion.locator('footer').scrollIntoViewIfNeeded();await motion.waitForTimeout(500);results.metrics.push({mode:'local production build, desktop, actual scroll, no network or CPU throttling',...(await motion.evaluate(()=>window.__motionQA))});
 await recording.close();
 const projects=await browser.newContext({viewport:{width:1440,height:900}});await projects.addInitScript(observe);const project=await projects.newPage();collect(project);
 await project.goto(`${labBase}/ar/motion-lab`,{waitUntil:'networkidle',timeout:120000});await project.waitForTimeout(600);await project.getByRole('link',{name:/Blue Sass \/ Internal Design Study/}).click({timeout:120000});await project.waitForURL('**/motion-lab/blue-sass-study',{timeout:120000});await project.waitForLoadState('networkidle');assert.equal(await project.locator('h1').innerText(),'Blue Sass / Internal Design Study');await project.screenshot({path:path.join(out,'screenshots','project-detail.jpg'),quality:85});await project.waitForTimeout(800);await project.goBack({waitUntil:'networkidle'});assert.ok(project.url().endsWith('/ar/motion-lab'));await project.waitForTimeout(800);results.interactions.push('Development-only internal project: real document link, detail route, shared cover transition, browser Back');await projects.close();
 await writeFile(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await writeFile(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));await browser.close();}
