import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { motionChromium } from './motion-browser-runtime.mjs';
const out=path.resolve('artifacts/content-cleanup');await mkdir(out,{recursive:true});
const result={checks:[],errors:[]};
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();
 page.on('pageerror',e=>result.errors.push(e.message));
 const go=async route=>{await page.goto('http://localhost:3000'+route,{waitUntil:'domcontentloaded'});await page.locator('main').waitFor();};
 for(const width of [375,768,1440,1920]){
  await page.setViewportSize({width,height:width<600?844:1000});await go('/ar');
  await page.locator('.cinema-home[data-enhanced]').waitFor({state:'attached'});
  const text=await page.locator('main').innerText();
  for(const redundant of ['INDEPENDENT DIGITAL STUDIO','استوديو رقمي. من الفكرة إلى الإطلاق.','WHAT WE BUILD','DESIGN × ENGINEERING','THE BLUE SASS WAY','IDEAS INTO EXPERIENCES'])assert.ok(!text.includes(redundant),redundant);
  assert.equal(await page.locator('footer').getByText('Crafted by',{exact:false}).count(),0);
  const services=page.locator('.cinema-service');assert.equal(await services.count(),8);
  for(let i=0;i<8;i++){
   const card=services.nth(i),button=card.getByRole('button');await button.click();await page.waitForFunction(el=>el.getAttribute('aria-expanded')==='true',await button.elementHandle());
   assert.ok(await card.locator('.cinema-service-reveal').isVisible());
   const direct=await card.locator('.cinema-service-direct').boundingBox(), trigger=await button.boundingBox();
   assert.ok(direct.width>=43.5&&direct.height>=43.5,'Direct service target has a 44px area, allowing subpixel rendering');
   assert.ok(await card.locator('.cinema-service-direct').evaluate(e=>parseFloat(getComputedStyle(e).minWidth)>=44&&parseFloat(getComputedStyle(e).minHeight)>=44));
   assert.ok(direct.x+direct.width<=trigger.x+1||trigger.x+trigger.width<=direct.x+1,'Service links do not overlap disclosure triggers');
   await page.waitForFunction(el=>el.getAttribute('data-pressed')!=='true',await button.elementHandle());await button.click();await page.waitForFunction(el=>el.getAttribute('aria-expanded')==='false',await button.elementHandle());
  }
  result.checks.push(`${width}px: removed decorative copy, all 8 services open/close, link targets are separate and >=44px`);
  await page.getByRole('button',{name:'القائمة',exact:true}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
  result.checks.push(`${width}px: navigation opens and Escape closes`);
 }
 await page.setViewportSize({width:375,height:844});await go('/ar');
 await page.locator('.cinema-service-direct').first().click();await page.waitForURL('**/ar/services/web');assert.ok(await page.locator('.creation-detail h1').isVisible());assert.equal(await page.locator('.creation-eyebrow').count(),0);
 result.checks.push('Mobile direct service link opens the real service detail route, without decorative labels');
 await go('/ar/tools');const initial=await page.locator('.tool-card').count();assert.ok(initial>1);
 const query=await page.locator('.tool-card h2').first().innerText();const search=page.locator('main input').first();await search.fill(query);await page.waitForFunction(()=>document.querySelectorAll('.tool-card').length===1);
 await search.fill('zzzz-no-matching-tool');await page.waitForFunction(()=>document.querySelectorAll('.tool-card').length===0);await search.fill('');await page.waitForFunction(expected=>document.querySelectorAll('.tool-card').length===expected,initial);
 const filter=page.locator('main button[aria-pressed]').nth(1);await filter.click();await page.waitForFunction(el=>el.getAttribute('aria-pressed')==='true',await filter.elementHandle());
 result.checks.push('Tool directory search, empty result state and category filters work');
 await go('/ar/tools/qr-code-generator');await page.locator('#qr-data').fill('https://www.bluesass.nl/ar');await page.locator('form button[type=submit]').click();await page.getByRole('img',{name:'QR',exact:true}).waitFor();
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:/PNG/}).click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'blue-sass-qr.png');await download.saveAs(path.join(out,'qr-test.png'));result.checks.push('QR generation and actual PNG download work locally without calling a paid service');
 await go('/en/tools/invoice-generator');const quantity=page.locator('#quantity-0');await quantity.fill('0.25');assert.equal(await quantity.evaluate(e=>e.validity.stepMismatch),false);result.checks.push('Invoice fractional quantity remains valid after public layout edits');
 assert.equal(result.errors.length,0,result.errors.join('\n'));
}finally{await browser.close();await writeFile(path.join(out,'interaction-results.json'),JSON.stringify(result,null,2));}
console.log(JSON.stringify(result,null,2));
