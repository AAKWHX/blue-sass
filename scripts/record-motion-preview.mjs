import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import assert from 'node:assert/strict';
import { motionChromium } from './motion-browser-runtime.mjs';
const out=path.resolve('artifacts/motion-preview/recordings');await mkdir(out,{recursive:true});
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const recordings=[];
async function capture(page,name,action){
 const directory=path.resolve(`tmp/motion-preview-frames/${name}`);await mkdir(directory,{recursive:true});
 let running=true;const frames=[];
 const worker=(async()=>{while(running){const time=Date.now(),file=path.join(directory,`${frames.length}.jpg`);await writeFile(file,await page.screenshot({type:'jpeg',quality:80}));frames.push({time,file});await page.waitForTimeout(60);}})();
 try{await action();}finally{running=false;await worker;}
 const end=Date.now();const fps=10;const file=path.join(out,`${name}.webm`);
 const encoder=spawn(path.join(process.env.LOCALAPPDATA,'ms-playwright/ffmpeg-1013/ffmpeg-win64.exe'),['-y','-loglevel','error','-f','image2pipe','-c:v','mjpeg','-r',String(fps),'-i','pipe:0','-an','-c:v','libvpx-vp9','-b:v','0','-crf','34','-threads','2','-pix_fmt','yuv420p',file],{stdio:['pipe','ignore','pipe']});
 let errors='';encoder.stderr.on('data',v=>errors+=v);const done=once(encoder,'close');
 for(let i=0;i<frames.length;i++){const duration=((frames[i+1]?.time||end)-frames[i].time)/1000;frames[i].duration=duration;const jpeg=await readFile(frames[i].file);for(let n=0;n<Math.max(1,Math.round(duration*fps));n++)if(!encoder.stdin.write(jpeg))await once(encoder.stdin,'drain');}
 encoder.stdin.end();assert.equal((await done)[0],0,errors);
 const evidence={name,file,bytes:(await stat(file)).size,captureDurationMs:end-frames[0].time,actualFrames:frames.length,encodedFPS:fps,method:'Actual browser screenshots while native wheel events run; measured frame durations quantized to 10 fps, no interpolation'};
 await writeFile(path.join(directory,'frames.json'),JSON.stringify(frames));recordings.push(evidence);console.log(name);
}
try{
 for(const width of [390,814,1440]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();
  await page.goto('http://localhost:3002/ar/motion-preview',{waitUntil:'networkidle'});await page.locator('[data-enhanced=true]').waitFor();
  const travel=await page.locator('[data-motion-preview]').evaluate(el=>Number(el.dataset.end)-Number(el.dataset.start));
  await capture(page,`scroll-${width}`,async()=>{await page.waitForTimeout(600);for(let i=0;i<55;i++){await page.mouse.wheel(0,travel/55);await page.waitForTimeout(160);}await page.waitForTimeout(900);for(let i=0;i<35;i++){await page.mouse.wheel(0,-travel/35);await page.waitForTimeout(150);}await page.waitForTimeout(600);});
  if(width===1440){
   await page.locator('[data-motion-preview]').evaluate(el=>scrollTo(0,Number(el.dataset.start)+.64*(Number(el.dataset.end)-Number(el.dataset.start))));await page.waitForTimeout(900);
   await capture(page,'navigation-and-back',async()=>{await page.locator('[data-study="0"] a').focus();await page.keyboard.press('Enter');await page.waitForURL('**/project/responsive-experience');await page.waitForTimeout(1000);await page.mouse.wheel(0,300);await page.waitForTimeout(800);await page.goBack();await page.waitForTimeout(1700);});
   await page.goto('http://localhost:3000/ar',{waitUntil:'networkidle'});await page.waitForTimeout(800);
   await capture(page,'before-public-home',async()=>{for(let i=0;i<25;i++){await page.mouse.wheel(0,100);await page.waitForTimeout(160);}await page.waitForTimeout(700);});
  }
  await context.close();
 }
}finally{await browser.close();await writeFile(path.join(out,'evidence.json'),JSON.stringify(recordings,null,2));}
