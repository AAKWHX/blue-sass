import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {motionChromium} from './motion-browser-runtime.mjs';
const out='artifacts/discovery';await mkdir(`${out}/screenshots`,{recursive:true});
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const desktopOnly=process.argv.includes('--desktop-only');const previous=desktopOnly?JSON.parse(await readFile(`${out}/browser-results.json`,'utf8')):null;
const results={cases:previous?.cases.filter(item=>item.width!==1440)||[],errors:[],timing:null};
const overflow=page=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
try{
 for(const width of desktopOnly?[1440]:[390,856,1440])for(const locale of ['ar','en','nl']){
  const page=await browser.newPage({viewport:{width,height:850}});page.on('pageerror',error=>results.errors.push(error.message));
  if(width===1440&&locale==='ar')await page.addInitScript(()=>{window.introPhases=[];let previous='';const tick=setInterval(()=>{const phase=document.querySelector('.bs-brand-intro')?.getAttribute('data-phase')||'done';if(phase!==previous){window.introPhases.push({phase,time:performance.now()});previous=phase;}if(previous==='done'&&window.introPhases.length>2)clearInterval(tick);},20);});
  await page.goto(`http://localhost:3000/${locale}`,{waitUntil:'domcontentloaded'});
  await page.locator('.bs-brand-intro').waitFor();
  if(width===1440&&locale==='ar'){
   await page.waitForFunction(()=>document.querySelector('.bs-brand-intro')?.getAttribute('data-phase')==='brand');await page.screenshot({path:`${out}/screenshots/intro-desktop.png`});
   await page.locator('.bs-brand-intro').waitFor({state:'detached',timeout:12000});results.timing=await page.evaluate(()=>window.introPhases);
   const brand=results.timing.find(row=>row.phase==='brand'),glitch=results.timing.find(row=>row.phase==='glitch');assert.ok(glitch.time-brand.time>=4900&&glitch.time-brand.time<5700);
  }else await page.locator('.bs-intro-skip').click();
  await page.waitForFunction(()=>!document.querySelector('.bs-brand-intro')&&!document.querySelector('main')?.inert);
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('.bs-infinity-face').count(),192);
  const control=page.locator('.bs-metal-control');await control.scrollIntoViewIfNeeded();
  const rotor=page.locator('.bs-metal-rotor'),before=await rotor.getAttribute('style');const rect=await control.boundingBox();
  await page.mouse.move(rect.x+rect.width*.4,rect.y+rect.height*.5);const gestureStart=Date.now();await page.mouse.down();await page.mouse.move(rect.x+rect.width*.7,rect.y+rect.height*.25);await page.mouse.up();assert.ok(Date.now()-gestureStart<2800,'Short-drag automation must finish before the 3-second navigation threshold');await page.waitForTimeout(70);assert.equal(new URL(page.url()).pathname,`/${locale}`);assert.notEqual(await rotor.getAttribute('style'),before);
  await control.focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');await page.keyboard.press('Tab');
  if(width===1440&&locale==='ar'){await control.focus();for(let i=0;i<30;i++)await page.keyboard.press('ArrowRight');await page.waitForTimeout(80);const style=await rotor.getAttribute('style');assert.ok(Math.abs(Number(style.match(/rotateY\(([-\d.]+)deg\)/)?.[1]))>360,style);await page.keyboard.press('Home');await page.keyboard.press('Tab');}
  await page.mouse.click(12,820);await page.waitForTimeout(80);assert.ok(await page.locator('.bs-reactive-lights').evaluate(el=>el.getAnimations({subtree:true}).length)>0,'background click ripple');
  if(locale==='ar')await page.screenshot({path:`${out}/screenshots/home-${width}.png`});
  assert.equal(await overflow(page),false);
  const service=page.locator('[data-service-scenes]');await page.waitForFunction(()=>document.querySelector('[data-service-scenes]')?.dataset.stacked==='true');
  await service.evaluate(el=>scrollTo(0,Number(el.dataset.sceneStart)+.02*(Number(el.dataset.sceneEnd)-Number(el.dataset.sceneStart))));await page.waitForTimeout(500);assert.equal(await service.getAttribute('data-active-service'),'0');
  const gallery=page.locator('.immersive-gallery');await gallery.scrollIntoViewIfNeeded();await page.waitForTimeout(650);assert.equal(await gallery.locator('[role=tab]').count(),8);
  await page.locator('#design-tab-3').click({force:true});await page.waitForTimeout(650);assert.ok((await page.locator('.bs-gallery-caption').innerText()).includes('Neal.fun'));
  if(width===1440&&locale==='ar'){for(let i=0;i<8;i++){await page.locator(`#design-tab-${i}`).click({force:true});await page.waitForTimeout(650);assert.ok(await page.locator('.bs-gallery-caption a').isVisible());assert.ok(await page.locator('.immersive-gallery-slide[data-active=true] img').evaluate(el=>el.complete&&el.naturalWidth>0));}}
  await page.locator('#design-tab-3').focus();await page.keyboard.press('End');assert.equal(await page.locator('#design-tab-7').getAttribute('aria-selected'),'true');assert.ok((await page.locator('.bs-gallery-caption a').getAttribute('href')).includes('excalidraw'));
  if(locale==='ar')await page.screenshot({path:`${out}/screenshots/resources-${width}.png`});
  await page.goto(`http://localhost:3000/${locale}/discover`,{waitUntil:'domcontentloaded'});await page.locator('.bs-discovery-card').first().waitFor();assert.equal(await page.locator('.bs-discovery-card').count(),15);assert.equal(await page.locator('.bs-discovery-filters button').count(),11);
  if(width===1440&&locale==='ar'){
   for(let i=1;i<11;i++){await page.locator('.bs-discovery-filters button').nth(i).click();await page.waitForTimeout(650);assert.equal(await page.locator('.bs-discovery-card').count(),15,`category ${i}`);}
   await page.locator('.bs-discovery-filters button').first().click();await page.waitForTimeout(650);assert.equal(await page.locator('.bs-discovery-card').count(),150);
  }
  assert.equal(await overflow(page),false);if(locale==='ar')await page.screenshot({path:`${out}/screenshots/discover-${width}.png`});
  await page.goto(`http://localhost:3000/${locale}/compare`,{waitUntil:'domcontentloaded'});await page.locator('.bs-comparison').first().waitFor();assert.equal(await page.locator('.bs-comparison').count(),12);assert.equal(await page.locator('.bs-comparison-pair article').count(),24);assert.equal(await overflow(page),false);
  await page.locator('input[type=search]').fill('Claude');assert.equal(await page.locator('.bs-comparison').count(),1);assert.equal(await page.locator('#claude-codex article').count(),2);
  if(locale==='ar')await page.screenshot({path:`${out}/screenshots/compare-${width}.png`});
  results.cases.push({width,locale,drag:true,keyboard:true,background:true,serviceMotion:true,gallery:8,directory:true,comparison:true});await page.close();console.log(`Passed ${width}/${locale}`);
 }
 const page=await browser.newPage({viewport:{width:1440,height:850}});await page.goto('http://localhost:3000/ar');await page.locator('.bs-intro-skip').click();const control=page.locator('.bs-metal-control');const rect=await control.boundingBox();await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await page.waitForTimeout(1100);await page.mouse.up();await page.waitForTimeout(2100);assert.equal(new URL(page.url()).pathname,'/ar');await page.mouse.down();await page.waitForURL(url=>url.pathname!=='/ar',{timeout:6000});await page.mouse.up();assert.ok(/^\/ar\/(services|about|projects|products|subscriptions|hosting|jobs|marketplace|discover|compare)$/.test(new URL(page.url()).pathname));results.longHold=page.url();
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://localhost:3000/ar');await page.locator('.bs-intro-skip').click();assert.equal(await page.locator('.bs-metal-drift').evaluate(el=>el.getAnimations().length),0);assert.equal(await page.locator('[data-stacked=true]').count(),0);await page.close();results.reducedMotion=true;
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto('http://localhost:3000/ar/discover');assert.equal(await nojs.locator('.bs-discovery-card').count(),15);await nojs.goto('http://localhost:3000/ar');assert.equal(await nojs.locator('.bs-brand-intro').count(),0);assert.ok(await nojs.locator('h1').isVisible());await nojs.close();results.noJavaScript=true;assert.deepEqual(results.errors,[]);
}finally{await writeFile(`${out}/browser-results.json`,JSON.stringify(results,null,2));await browser.close();}
