import {mkdir,writeFile,readFile,stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';import {once} from 'node:events';import path from 'node:path';
import {motionChromium} from './motion-browser-runtime.mjs';
const out=path.resolve('artifacts/visual-polish');await mkdir(`${out}/recordings`,{recursive:true});
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report=[];
try{for(const width of [856]){
 const page=await browser.newPage({viewport:{width,height:676}});await page.goto('http://localhost:3000/ar',{waitUntil:'networkidle'});await page.locator('[data-stacked=true]').waitFor();await page.waitForTimeout(5500);
 const folder=path.resolve(`tmp/polish-capture-${width}`);await mkdir(folder,{recursive:true});const frames=[];let running=true;
 const worker=(async()=>{while(running){const file=path.join(folder,`${frames.length}.jpg`),time=Date.now();await writeFile(file,await page.screenshot({type:'jpeg',quality:75}));frames.push({file,time});await page.waitForTimeout(80);}})();
 const rect=await page.locator('.bs-metal-control').boundingBox();await page.mouse.move(rect.x+rect.width*.4,rect.y+rect.height*.5);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.8,rect.y+rect.height*.35,{steps:35});await page.waitForTimeout(700);await page.mouse.move(rect.x+rect.width*.25,rect.y+rect.height*.6,{steps:35});await page.mouse.up();await page.waitForTimeout(500);for(let i=0;i<18;i++){await page.mouse.wheel(0,230);await page.waitForTimeout(160);}await page.waitForTimeout(700);running=false;await worker;const end=Date.now();await page.close();
 const file=`${out}/recordings/home-${width}.webm`,fps=8;
 const encoder=spawn(path.join(process.env.LOCALAPPDATA,'ms-playwright/ffmpeg-1013/ffmpeg-win64.exe'),['-y','-loglevel','error','-f','image2pipe','-c:v','mjpeg','-r',String(fps),'-i','pipe:0','-an','-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','6','-crf','36','-b:v','0','-pix_fmt','yuv420p',file],{stdio:['pipe','ignore','pipe']});let errors='';encoder.stderr.on('data',v=>errors+=v);const done=once(encoder,'close');
 for(let i=0;i<frames.length;i++){const jpeg=await readFile(frames[i].file),duration=((frames[i+1]?.time||end)-frames[i].time)/1000;for(let n=0;n<Math.max(1,Math.round(duration*fps));n++)if(!encoder.stdin.write(jpeg))await once(encoder.stdin,'drain');}encoder.stdin.end();if((await done)[0])throw new Error(errors);
 report.push({width,height:676,file,bytes:(await stat(file)).size,actualFrames:frames.length,captureDurationMs:end-frames[0].time,encodedFPS:fps,method:'Real screenshots during native wheel scrolling, measured holds, no interpolated frames'});console.log(`Recorded ${width}`);
}}finally{await browser.close();await writeFile(`${out}/recordings/evidence.json`,JSON.stringify(report,null,2));}

