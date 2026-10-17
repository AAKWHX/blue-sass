import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {motionChromium} from './motion-browser-runtime.mjs';
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try{
 for(const [width,height] of [[856,676],[1440,676],[390,676],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3002/ar/motion-preview',{waitUntil:'networkidle'});await page.locator('[data-enhanced=true]').waitFor();
  const states=[];
  for(const fraction of [.26,.46,.64,.86,.26]){
   await page.locator('[data-motion-preview]').evaluate((el,f)=>scrollTo(0,Number(el.dataset.start)+f*(Number(el.dataset.end)-Number(el.dataset.start))),fraction);await page.waitForTimeout(700);
   states.push(await page.locator('[data-motion-preview]').evaluate(el=>({scene:el.dataset.scene,service:el.dataset.service,track:getComputedStyle(el.querySelector('.mp-project-track')).transform,position:getComputedStyle(el.querySelector('.mp-stage')).position,overflow:document.documentElement.scrollWidth>innerWidth+1})));
  }
  assert.ok(states.every(s=>s.position==='fixed'&&!s.overflow));assert.notEqual(states[0].service,states[1].service);assert.notEqual(states[2].track,states[3].track);assert.equal(states[4].service,states[0].service);
  const before=await page.locator('[data-motion-preview]').getAttribute('data-progress');await page.mouse.move(width/2,180);await page.mouse.wheel(0,350);await page.waitForTimeout(800);const after=await page.locator('[data-motion-preview]').getAttribute('data-progress');assert.notEqual(before,after);
  await page.screenshot({path:`artifacts/motion-preview/screenshots/fixed-${width}-${height}.png`});assert.deepEqual(errors,[]);
  results.push({width,height,states,nativeWheelChangesProgress:true,errors});await page.close();
 }
}finally{await browser.close();await writeFile('artifacts/motion-preview/height-fix-results.json',JSON.stringify(results,null,2));}
console.log('Passed all four heights, forward/reverse transforms and native wheel');
