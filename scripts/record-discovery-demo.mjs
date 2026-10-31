import {mkdir,writeFile,readFile,stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';import {once} from 'node:events';import path from 'node:path';
import {motionChromium} from './motion-browser-runtime.mjs';
import assert from 'node:assert/strict';
const out='artifacts/discovery';await mkdir(`${out}/recordings`,{recursive:true});
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();
 const folder=path.resolve('tmp/discovery-capture');await mkdir(folder,{recursive:true});const frames=[];let running=true;
 const worker=(async()=>{while(running){const file=path.join(folder,`${frames.length}.jpg`),time=Date.now();await writeFile(file,await page.screenshot({type:'jpeg',quality:75}));frames.push({file,time});await page.waitForTimeout(100);}})();
 await page.goto('http://localhost:3000/ar');await page.locator('.bs-brand-intro').waitFor({state:'detached',timeout:15000});await page.waitForTimeout(1400);
 const rect=await page.locator('.bs-metal-control').boundingBox();await page.mouse.move(rect.x+rect.width*.4,rect.y+rect.height*.5);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.7,rect.y+rect.height*.3);await page.mouse.up();await page.waitForTimeout(700);assert.equal(new URL(page.url()).pathname,'/ar');assert.equal(await page.locator('.bs-infinity-face').count(),192);
 const samples=await page.evaluate(()=>new Promise(resolve=>{const times=[];let previous=performance.now(),count=0;const tick=now=>{times.push(now-previous);previous=now;if(++count<90)requestAnimationFrame(tick);else{times.sort((a,b)=>a-b);resolve({medianMs:times[45],p95Ms:times[85],frames:90});}};requestAnimationFrame(tick);}));await writeFile(`${out}/frame-sample.json`,JSON.stringify({environment:'Desktop Chrome headless, 1440×900; not a physical phone benchmark',...samples},null,2));
 await page.locator('.immersive-gallery').scrollIntoViewIfNeeded();await page.waitForTimeout(1200);await page.locator('#design-tab-4').click({force:true});await page.waitForTimeout(1100);await page.locator('#design-tab-6').click({force:true});await page.waitForTimeout(1100);
 await page.goto('http://localhost:3000/ar/discover');await page.waitForTimeout(1100);await page.locator('.bs-discovery-filters button').nth(2).click();await page.waitForTimeout(1400);
 await page.goto('http://localhost:3000/ar/compare');await page.locator('input[type=search]').fill('Claude');await page.waitForTimeout(1600);
 await page.goto('http://localhost:3000/ar');await page.locator('.bs-intro-skip').waitFor();await page.keyboard.press('Escape');await page.waitForTimeout(700);await page.locator('.bs-metal-control').focus();await page.keyboard.press('Enter');await page.waitForTimeout(3200);assert.equal(new URL(page.url()).pathname,'/ar');await page.keyboard.down('Enter');await page.waitForURL(url=>url.pathname!=='/ar',{timeout:7000});await page.keyboard.up('Enter');await writeFile(`${out}/keyboard-hold.json`,JSON.stringify({escapeSkip:true,shortEnterCancelled:true,longEnterDestination:page.url()},null,2));await page.waitForTimeout(900);
 running=false;await worker;const end=Date.now();await page.close();await context.close();
 const file=path.resolve(`${out}/recordings/blue-sass-experience.webm`),fps=8;
 const encoder=spawn(path.join(process.env.LOCALAPPDATA,'ms-playwright/ffmpeg-1013/ffmpeg-win64.exe'),['-y','-loglevel','error','-f','image2pipe','-c:v','mjpeg','-r',String(fps),'-i','pipe:0','-an','-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','6','-crf','36','-b:v','0','-pix_fmt','yuv420p',file],{stdio:['pipe','ignore','pipe']});let errors='';encoder.stderr.on('data',value=>errors+=value);const done=once(encoder,'close');
 for(let i=0;i<frames.length;i++){const jpeg=await readFile(frames[i].file),duration=((frames[i+1]?.time||end)-frames[i].time)/1000;for(let n=0;n<Math.max(1,Math.round(duration*fps));n++)if(!encoder.stdin.write(jpeg))await once(encoder.stdin,'drain');}encoder.stdin.end();if((await done)[0])throw new Error(errors);
 await writeFile(`${out}/recordings/evidence.json`,JSON.stringify({file,bytes:(await stat(file)).size,actualFrames:frames.length,captureDurationMs:end-frames[0].time,encodedFPS:fps,method:'Actual browser screenshots with measured holds; 8fps evidence recording, not a live frame-rate benchmark'},null,2));console.log(JSON.stringify(samples));
}finally{await browser.close();}
