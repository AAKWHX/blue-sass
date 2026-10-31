import assert from 'node:assert/strict';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {motionChromium} from './motion-browser-runtime.mjs';
const dir='artifacts/immersive-v2';await mkdir(`${dir}/screenshots`,{recursive:true});
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];const errors=[];
async function load(page,path){await page.goto(`http://127.0.0.1:3000${path}`,{waitUntil:'domcontentloaded'});await page.locator('main').waitFor();await page.evaluate(()=>document.fonts.ready);}
async function overflow(page){return page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));}
try{
 for(const locale of ['ar','en','nl'])for(const width of [375,814,1440]){
  const page=await browser.newPage({viewport:{width,height:width===375?844:900}});page.on('pageerror',e=>errors.push(`${locale}/${width}: ${e.message}`));
  await load(page,`/${locale}`);await page.locator('.immersive-intro[data-ready=true]').waitFor({state:'attached',timeout:12000});
  const dimensions=await overflow(page);assert.ok(dimensions.width<=width+1,`Home overflow ${locale} ${width}: ${dimensions.width}`);
  const hero=await page.locator('.cinema-hero').boundingBox();const media=await page.locator('.immersive-intro .immersive-media').boundingBox();
  assert.ok(media.width>=width-1&&media.height>=hero.height-1,'Hero media fills hero');
  await page.waitForFunction(()=>{const v=document.querySelector('.immersive-intro video');return !v||v.paused;},{timeout:10000});
  assert.equal(await page.locator('.immersive-tool-tile').count(),4);assert.equal(await page.locator('.cinema-person-glyph svg').count(),2);
  const gallery=page.locator('.immersive-gallery');await gallery.scrollIntoViewIfNeeded();await page.locator('#design-tab-1').click();await page.waitForFunction(()=>document.querySelector('#design-tab-1').getAttribute('aria-selected')==='true');assert.ok(await page.locator('#design-panel-1').isVisible());
  await page.locator('#design-tab-1').focus();await page.keyboard.press('End');assert.equal(await gallery.getAttribute('data-index'),'2');await page.keyboard.press('Home');assert.equal(await gallery.getAttribute('data-index'),'0');
  const seal=page.locator('footer a[aria-label$="— Blue Sass"]');assert.equal(await seal.count(),1);await seal.scrollIntoViewIfNeeded();assert.ok((await seal.boundingBox()).width>=200);assert.equal(await seal.getAttribute('href'),'https://www.bluesass.nl');
  if(locale==='ar'&&[375,1440].includes(width)){
   await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${dir}/screenshots/home-${width}.png`});
   for(const id of ['process','portfolio','home-tools','home-products','home-subscriptions','home-careers']){await page.locator(`#${id}`).scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:`${dir}/screenshots/${id}-${width}.png`});}
   await seal.scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/screenshots/seal-${width}.png`});
  }
  await load(page,`/${locale}/create-project`);const catalogDimensions=await overflow(page);assert.ok(catalogDimensions.width<=width+1,`Catalog overflow ${locale} ${width}`);
  const kinds=await page.locator('[data-project-kind]').evaluateAll(links=>links.map(a=>({kind:a.dataset.projectKind,href:a.getAttribute('href')})));
  assert.ok(kinds.length>=25);assert.equal(new Set(kinds.map(x=>x.href)).size,kinds.length);for(const item of kinds){assert.ok(item.href.includes(`kind=${item.kind}`));assert.ok(item.href.includes('type='));}
  assert.equal(await page.locator('.project-service-grid article').count(),8);assert.equal(await page.locator('.project-tools-grid').first().locator('a').count(),11);
  if(locale==='ar'&&[375,1440].includes(width))await page.screenshot({path:`${dir}/screenshots/catalog-${width}.png`});
  results.push({locale,width,home:dimensions,catalog:catalogDimensions,projectKinds:kinds.length,checks:'full-screen media, settled video, tool artwork, gallery click/keyboard, original-logo seal, contextual project links'});await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});const mediaRequests=[];page.on('request',r=>{if(/\.(webm|mp4)(\?|$)/.test(r.url()))mediaRequests.push(r.url());});await load(page,'/ar');await page.waitForTimeout(1200);assert.equal(await page.locator('main video').count(),0);assert.equal(mediaRequests.length,0);assert.equal(await page.locator('.immersive-intro').getAttribute('data-ready'),'true');await page.locator('#design-tab-2').click();assert.equal(await page.locator('.immersive-gallery').getAttribute('data-index'),'2');results.push({mode:'reduced-motion',videoRequests:mediaRequests.length,gallery:'clickable'});await page.close();
 const dataPage=await browser.newPage({viewport:{width:390,height:844}});await dataPage.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g',addEventListener(){},removeEventListener(){}}}));const dataRequests=[];dataPage.on('request',r=>{if(/\.(webm|mp4)(\?|$)/.test(r.url()))dataRequests.push(r.url());});await load(dataPage,'/ar');await dataPage.locator('.immersive-intro[data-ready=true]').waitFor({state:'attached',timeout:10000});assert.equal(dataRequests.length,0);results.push({mode:'save-data',videoRequests:0,fallback:'all hero content available'});await dataPage.close();
 const scroll=await browser.newPage({viewport:{width:1440,height:900}});await load(scroll,'/ar');await scroll.locator('.cinema-home[data-scroll-motion=true]').waitFor({state:'attached'});
 const positions=await scroll.locator('#home-products').evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,height:el.getBoundingClientRect().height}));const indices=[];
 for(const fraction of [.1,.6,.95,.1]){await scroll.evaluate(({top,height,fraction})=>scrollTo(0,top-innerHeight*.6+(height-innerHeight*.4)*fraction),{...positions,fraction});await scroll.waitForTimeout(250);indices.push(await scroll.locator('.immersive-gallery').getAttribute('data-index'));}assert.deepEqual(indices,['0','1','2','0']);results.push({mode:'scroll-gallery',indices});
 const response=await scroll.request.get('http://127.0.0.1:3000/ar/quote?type=ai&kind=ai-knowledge',{maxRedirects:0});assert.ok([303,307].includes(response.status()));assert.ok(decodeURIComponent(response.headers().location).includes('type=ai&kind=ai-knowledge'));results.push({mode:'auth-routing',status:response.status(),contextPreserved:true});await scroll.close();
 assert.deepEqual(errors,[]);await writeFile(`${dir}/browser-verification.json`,JSON.stringify({passed:true,results,errors},null,2));console.log(JSON.stringify({passed:true,cases:results.length,errors}));
}catch(error){await writeFile(`${dir}/browser-verification.json`,JSON.stringify({passed:false,results,errors,failure:String(error)},null,2));throw error;}finally{await browser.close();}
