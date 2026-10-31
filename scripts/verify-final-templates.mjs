import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {motionChromium} from './motion-browser-runtime.mjs';
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try{
 for(const width of [390,702,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await page.goto('http://localhost:3000/ar',{waitUntil:'domcontentloaded'});await page.locator('.bs-brand-intro').waitFor();await page.keyboard.press('Escape');
  const gallery=page.locator('.bs-template-gallery');await gallery.scrollIntoViewIfNeeded();
  for(let i=0;i<16;i++){
   const tab=page.locator(`#design-tab-${i}`);await tab.scrollIntoViewIfNeeded();await tab.click();
   assert.equal(await gallery.locator('.bs-gallery-caption strong').innerText(),await gallery.locator('.bs-template-content h3').innerText());
   assert.equal(await gallery.locator('.bs-template-action').getAttribute('href'),`/ar/services/${['web','android','ios','windows','store','erp','ai','design'][Math.floor(i/2)]}`);
   assert.equal(await gallery.locator('.bs-template-action').evaluate(node=>getComputedStyle(node).color),'rgb(20, 32, 45)');
   if(i===13)assert.equal(await gallery.locator('.bs-template-flow span').count(),3);
   if(i===15)assert.equal(await gallery.locator('.bs-template-phone').count(),1);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   assert.equal(await gallery.evaluate(root=>{const stage=root.querySelector('.immersive-gallery-stage').getBoundingClientRect(),preview=root.querySelector('.bs-template-window').getBoundingClientRect();return preview.top>=stage.top-1&&preview.bottom<=stage.bottom+1;}),true,'template must fit inside the visible stage');
  }
  await gallery.scrollIntoViewIfNeeded();await page.screenshot({path:`artifacts/refinement/screenshots/templates-final-${width}.png`});
  await gallery.locator('.bs-template-action').click();await page.waitForURL('**/ar/services/design');
  results.push({width,matchingTemplates:16,phoneDesign:true,automationWorkflow:true,serviceLink:true,noOverflow:true});await page.close();
 }
 await writeFile('artifacts/refinement/final-template-results.json',JSON.stringify(results,null,2));
}finally{await browser.close();}
