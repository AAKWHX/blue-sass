import {mkdir,writeFile,readFile} from 'node:fs/promises';import assert from 'node:assert/strict';
import {motionChromium} from './motion-browser-runtime.mjs';
const out='artifacts/visual-polish';await mkdir(`${out}/screenshots`,{recursive:true});
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const result={cases:[],errors:[]};
try{
 for(const width of [390,856,1440])for(const locale of ['ar','en','nl']){
  const page=await browser.newPage({viewport:{width,height:676}});page.on('pageerror',e=>result.errors.push(e.message));
  await page.goto(`http://localhost:3000/${locale}`,{waitUntil:'domcontentloaded'});await page.locator('[data-stacked=true]').waitFor();await page.waitForTimeout(1300);
  assert.equal(await page.locator('.cinema-opening img,.cinema-opening video,.cinema-opening canvas').count(),0);
  assert.equal(await page.locator('.bs-metal-facet').count(),96);
  const control=page.locator('.bs-metal-control'),rotor=page.locator('.bs-metal-rotor');
  const before=await rotor.evaluate(el=>getComputedStyle(el).transform);const rect=await control.boundingBox();
  await page.mouse.move(rect.x+rect.width*.45,rect.y+rect.height*.5);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.7,rect.y+rect.height*.4,{steps:8});await page.mouse.up();await page.waitForTimeout(80);
  const after=await rotor.evaluate(el=>getComputedStyle(el).transform);assert.notEqual(before,after,`${width}/${locale} drag`);
  await control.focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(previous=>getComputedStyle(document.querySelector('.bs-metal-rotor')).transform!==previous,after);
  await page.keyboard.press('Tab');
  if(locale==='ar')await page.screenshot({path:`${out}/screenshots/hero-${width}.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  const stage=page.locator('[data-service-scenes]');
  await stage.evaluate(el=>scrollTo(0,Number(el.dataset.sceneStart)+.03*(Number(el.dataset.sceneEnd)-Number(el.dataset.sceneStart))));await page.waitForTimeout(700);
  assert.equal(await stage.getAttribute('data-active-service'),'0');assert.equal(await page.locator('.bs-service-scene .bs-service-image img').count(),8);
  const finish=await page.locator('[data-service-scene="0"]').evaluate(el=>({background:getComputedStyle(el).backgroundImage,border:getComputedStyle(el).borderColor,position:getComputedStyle(el).position}));assert.ok(finish.background.includes('linear-gradient'));assert.equal(finish.position,'absolute');
  if(locale==='ar')await page.screenshot({path:`${out}/screenshots/gold-${width}.png`});
  await page.locator('[data-scene-select="6"]').click();await page.waitForTimeout(700);assert.equal(await stage.getAttribute('data-active-service'),'6');
  await page.goto(`http://localhost:3000/${locale}/services`,{waitUntil:'domcontentloaded'});await page.locator('.creation-card .bs-service-image img').first().waitFor();assert.equal(await page.locator('.creation-card .bs-service-image img').count(),8);
  await page.goto(`http://localhost:3000/${locale}/services/web`,{waitUntil:'domcontentloaded'});assert.ok((await page.locator('.creation-detail-art img').getAttribute('src')).includes('service-web-3d'));
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`http://localhost:3000/${locale}`,{waitUntil:'domcontentloaded'});await page.waitForTimeout(500);assert.equal(await page.locator('[data-stacked=true]').count(),0);assert.equal(await page.locator('.bs-metal-drift').evaluate(el=>el.getAnimations().length),0);
  result.cases.push({width,locale,drag:true,keyboard:true,gold:true,serviceImages:8,reducedMotion:true});await page.close();console.log(`Passed ${width}/${locale}`);
 }
 assert.deepEqual(result.errors,[]);
 result.posters=JSON.parse(await readFile(`${out}/poster-quality.json`,'utf8'));
}finally{await browser.close();await writeFile(`${out}/browser-results.json`,JSON.stringify(result,null,2));}
