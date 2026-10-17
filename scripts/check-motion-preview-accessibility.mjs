import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { motionChromium } from './motion-browser-runtime.mjs';
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report={checks:[],performance:{}};
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://localhost:3002/ar/motion-preview',{waitUntil:'networkidle'});await page.locator('[data-enhanced=true]').waitFor();
 await page.locator('[data-motion-preview]').evaluate(el=>scrollTo(0,Number(el.dataset.start)+.165*(Number(el.dataset.end)-Number(el.dataset.start))));await page.waitForTimeout(900);
 const overlap=await page.locator('.mp-stage').evaluate(el=>Array.from(el.querySelectorAll('[data-scene]')).slice(0,2).map(p=>{const r=p.getBoundingClientRect(),s=el.getBoundingClientRect();return Math.min(r.bottom,s.bottom)-Math.max(r.top,s.top);}));
 assert.ok(overlap.every(h=>h>100));report.checks.push({overlapVisibleHeights:overlap});
 await page.screenshot({path:'artifacts/motion-preview/screenshots/1440-overlap.png'});
 const perfPromise=page.evaluate(()=>new Promise(resolve=>{const start=performance.now(),times=[];let last=start;function frame(t){times.push(t-last);last=t;if(t-start<3000)requestAnimationFrame(frame);else resolve(times.slice(1));}requestAnimationFrame(frame);}));
 for(let i=0;i<20;i++){await page.mouse.wheel(0,90);await page.waitForTimeout(100);}const samples=await perfPromise;samples.sort((a,b)=>a-b);
 report.performance={environment:'Headless installed Chrome on development Windows machine; no mobile CPU emulation; not field CWV',samples:samples.length,medianFrameMs:samples[Math.floor(samples.length*.5)],p95FrameMs:samples[Math.floor(samples.length*.95)],framesOver50ms:samples.filter(t=>t>50).length};
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(600);assert.equal(await page.locator('[data-enhanced=true]').count(),0);assert.equal(await page.locator('.pin-spacer [data-scene]').count(),0);report.checks.push('Live reduced-motion change removes pin spacer');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('[data-enhanced=true]').waitFor();
 await page.setViewportSize({width:814,height:676});await page.waitForTimeout(700);assert.equal(await page.locator('[data-enhanced=true]').count(),1);report.checks.push('Short 814×676 window retains scroll-driven scenes');
 await page.setViewportSize({width:390,height:844});await page.locator('[data-enhanced=true]').waitFor();assert.equal(await page.locator('[data-motion-preview]').getAttribute('data-trigger-count'),'1');report.checks.push('Resize restores exactly one owned ScrollTrigger');
 const contrast=(fore,back)=>{const lum=hex=>{const c=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};const a=lum(fore),b=lum(back);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
 report.contrast=[['service body','c6cbd2','242a34'],['project body','c6cbd2','11151b'],['finale body','3b4450','dde2e8']].map(([name,fg,bg])=>({name,ratio:contrast(fg,bg)}));assert.ok(report.contrast.every(v=>v.ratio>=4.5));
 report.checks.push('Opaque text surfaces exceed WCAG AA 4.5:1 for normal text; video overlay not formally pixel-sampled');
 const html=await(await fetch('http://localhost:3002/ar/motion-preview')).text();assert.ok(html.includes('noindex'));report.checks.push('Preview metadata includes noindex');
}finally{await browser.close();await writeFile('artifacts/motion-preview/accessibility-performance.json',JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
