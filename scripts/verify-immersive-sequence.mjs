import {motionChromium} from './motion-browser-runtime.mjs';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const results=[];
 for(const width of [390,1440]){
  const p=await browser.newPage({viewport:{width,height:900}});const requests=[];p.on('request',r=>{if(/\.(webm|mp4)$/.test(r.url()))requests.push(r.url());});await p.goto('http://127.0.0.1:3000/ar',{waitUntil:'domcontentloaded'});
  await p.locator('.immersive-intro[data-started=true][data-ready=false]').waitFor({state:'attached',timeout:10000});
  await p.waitForTimeout(1100);const opening=await p.locator('.immersive-intro').evaluate(el=>({ready:el.dataset.ready,contentOpacity:getComputedStyle(el.querySelector('.immersive-hero-content')).opacity,wordmarkOpacity:getComputedStyle(el.querySelector('.immersive-wordmark')).opacity,time:el.querySelector('video')?.currentTime}));
  assert.equal(opening.ready,'false');assert.equal(Number(opening.contentOpacity),0);assert.ok(Number(opening.wordmarkOpacity)>.9);await p.screenshot({path:`artifacts/immersive-v2/screenshots/intro-letters-${width}.png`});
  await p.locator('.immersive-intro[data-ready=true]').waitFor({state:'attached'});await p.waitForTimeout(1400);
  const settled=await p.locator('.immersive-intro').evaluate(el=>({ready:el.dataset.ready,contentOpacity:getComputedStyle(el.querySelector('.immersive-hero-content')).opacity,paused:el.querySelector('video')?.paused,time:el.querySelector('video')?.currentTime}));
  assert.equal(settled.ready,'true');assert.equal(Number(settled.contentOpacity),1);assert.equal(settled.paused,true);assert.ok(settled.time>=3.2);await p.screenshot({path:`artifacts/immersive-v2/screenshots/intro-ready-${width}.png`});
  results.push({width,opening,settled,initialVideos:requests});await p.close();
 }
 await writeFile('artifacts/immersive-v2/intro-sequence-verification.json',JSON.stringify({passed:true,results},null,2));console.log('Intro sequence passed on mobile and desktop');
}finally{await browser.close();}
