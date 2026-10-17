import {mkdir,writeFile,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {motionChromium} from './motion-browser-runtime.mjs';
const out='artifacts/motion-integration';await mkdir(`${out}/screenshots`,{recursive:true});
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=process.argv.includes('--resume')?JSON.parse(await readFile(`${out}/browser-results.json`,'utf8')):{home:[],pages:[],accessibility:[],errors:[]};const base='http://localhost:3000';
async function seek(page,selector,f){await page.locator(selector).evaluate((el,f)=>{const spacer=el.parentElement;const start=Number(el.dataset.sceneStart??(spacer.getBoundingClientRect().top+scrollY-92));const end=Number(el.dataset.sceneEnd??(start+spacer.offsetHeight-el.offsetHeight));scrollTo({top:start+f*(end-start),behavior:'instant'});},f);await page.waitForTimeout(650);}
try{
 for(const width of (process.argv.includes('--resume')?[]:[390,856,1440]))for(const locale of ['ar','en','nl']){
  const context=await browser.newContext({viewport:{width,height:676}}),page=await context.newPage();page.on('pageerror',e=>results.errors.push(e.message));
  await page.goto(`${base}/${locale}`,{waitUntil:'domcontentloaded'});await page.locator('[data-stacked=true]').waitFor();
  const stage='[data-service-scenes]';const states=[];
  for(const f of [.02,.35,.7,.99,.02]){await seek(page,stage,f);states.push(await page.locator(stage).evaluate(el=>({active:el.dataset.activeService,position:getComputedStyle(el).position,top:el.getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth+1,activeLinks:el.querySelectorAll('article:not([inert]) a').length})));}
  assert.equal(states[0].active,'0');assert.notEqual(states[0].active,states[2].active);assert.equal(states[4].active,'0');assert.ok(states.every(s=>s.position==='fixed'&&!s.overflow&&s.activeLinks===1));
  await page.locator('[data-scene-select="3"]').click();await page.waitForTimeout(700);assert.equal(await page.locator(stage).getAttribute('data-active-service'),'3');
  if(locale==='ar')await page.screenshot({path:`${out}/screenshots/home-services-${width}.png`});
  for(const id of ['home-tools','home-products','home-subscriptions','home-hosting','home-careers']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(450);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width}/${locale}/${id}`);}
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(500);assert.equal(await page.locator('[data-stacked=true]').count(),0);assert.equal(await page.locator('.bs-service-scene[inert]').count(),0);
  results.home.push({width,locale,states,serviceSelector:true,reducedMotion:true});await context.close();console.log(`Home ${width}/${locale}`);
 }
 const paths=['services','services/web','services/android','services/ios','services/windows','services/store','services/erp','services/ai','services/design','services/company','services/apps','services/systems','about','projects','products','subscriptions','hosting','jobs','marketplace','create-project','tools','tools/qr-code-generator','tools/invoice-generator','tools/seo-checker','tools/message-checker','reviews','contact','privacy','terms','quote','audit'];
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:676}}),page=await context.newPage();page.on('pageerror',e=>results.errors.push(e.message));
  for(const route of paths){
   if(results.pages.some(p=>p.width===width&&p.route===route))continue;
   const response=await page.goto(`${base}/ar/${route}`,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200,route);await page.waitForTimeout(220);
   assert.ok(await page.locator('main h1').count()>0,route+' heading');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,route+': horizontal overflow');
   const track=page.locator('[data-track-scene=true]');let horizontal=false;
   if(await track.count()){
    await seek(page,'[data-track-scene=true]',.05);const start=await page.locator('[data-cinematic-track]').evaluate(el=>getComputedStyle(el).transform);
    await seek(page,'[data-track-scene=true]',.85);const end=await page.locator('[data-cinematic-track]').evaluate(el=>getComputedStyle(el).transform);assert.notEqual(start,end);horizontal=true;
   }else{await page.mouse.wheel(0,350);await page.waitForTimeout(180);}
   if(['services','services/web','create-project','subscriptions','about'].includes(route))await page.screenshot({path:`${out}/screenshots/${route.replaceAll('/','-')}-${width}.png`});
   results.pages.push({route,width,horizontal,status:response.status()});console.log(`Page ${width}/${route}`);
  }
  await context.close();
 }
 // Existing native links, keyboard and browser history still own navigation.
 const page=await browser.newPage({viewport:{width:856,height:676}});page.on('pageerror',e=>results.errors.push(e.message));
 await page.goto(`${base}/ar/services/web`,{waitUntil:'domcontentloaded'});
 const link=page.locator('main a[href="/ar/services"]').first();await link.focus();await page.keyboard.press('Enter');await page.waitForURL('**/ar/services');await page.waitForTimeout(800);
 assert.ok(await page.locator('main h1').evaluate(el=>el===document.activeElement));await page.goBack({waitUntil:'domcontentloaded'});await page.waitForTimeout(600);assert.ok(page.url().endsWith('/ar/services/web'));
 assert.equal(await page.locator('.bs-page-curtain').evaluate(el=>getComputedStyle(el).pointerEvents),'none');results.accessibility.push('Keyboard navigation, title focus and Back; curtain never intercepts input');
 await page.close();
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:676}}),nojs=await context.newPage();await nojs.goto(`${base}/ar`,{waitUntil:'domcontentloaded'});assert.equal(await nojs.locator('.bs-service-scene').count(),8);assert.equal(await nojs.locator('.bs-service-scene[inert]').count(),0);results.accessibility.push('No JavaScript: all 8 services remain readable in natural flow');await context.close();
 assert.deepEqual(results.errors,[]);
}finally{await writeFile(`${out}/browser-results.json`,JSON.stringify(results,null,2));await browser.close();}

