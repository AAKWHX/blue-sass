import { mkdir, writeFile, stat, readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import assert from 'node:assert/strict';
import { motionChromium } from './motion-browser-runtime.mjs';
const root=path.resolve('artifacts/motion-redesign'),captures=path.resolve('tmp/motion-captures'),stops=[];
const labBase=process.env.MOTION_LAB_URL||'http://localhost:3001';
const ffmpeg=path.join(process.env.LOCALAPPDATA,'ms-playwright/ffmpeg-1013/ffmpeg-win64.exe');
await mkdir(path.join(root,'recordings'),{recursive:true});

async function encodeFrames(frames,name){
 const file=path.join(root,'recordings',name+'.webm'),fps=6;
 const process=spawn(ffmpeg,['-y','-loglevel','error','-f','image2pipe','-c:v','mjpeg','-r',String(fps),'-i','pipe:0','-an','-c:v','libvpx-vp9','-b:v','0','-crf','36','-threads','2','-pix_fmt','yuv420p',file],{stdio:['pipe','ignore','pipe']});
 let errors='';process.stderr.on('data',b=>{errors+=b;});const finished=once(process,'close');
 for(const frame of frames){const jpeg=await readFile(frame.file);const count=Math.max(1,Math.round(frame.duration*fps));for(let n=0;n<count;n++)if(!process.stdin.write(jpeg))await once(process.stdin,'drain');}
 process.stdin.end();const [code]=await finished;assert.equal(code,0,errors);const bytes=(await stat(file)).size;assert.ok(bytes>1000);
 return {file,bytes,frames:frames.length,durationMs:Math.round(frames.reduce((s,f)=>s+f.duration,0)*1000),encodedFPS:fps,method:'Real browser frames; measured holds quantized to 6 fps; repeated frames only, no interpolation'};
}
if(process.argv.includes('--encode-existing')){
 const folder=path.resolve(process.argv[process.argv.indexOf('--encode-existing')+1]);assert.ok(folder.startsWith(captures+path.sep));
 const lines=(await readFile(path.join(folder,'frames.txt'),'utf8')).split('\n'),frames=[];
 for(let i=0;i<lines.length-1;i+=2)frames.push({file:lines[i].slice(6,-1),duration:Number(lines[i+1].slice(9))});
 const result=await encodeFrames(frames,'cinematic-scroll');await writeFile(path.join(root,'recordings','scroll-evidence.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exit(0);
}

// The bundled recordVideo API returned nonexistent files. Capture actual browser frames,
// preserve their measured timestamps, and encode them locally without interpolated frames.
async function startCapture(page,name){
 const folder=path.join(captures,name+'-'+Date.now());await mkdir(folder,{recursive:true});
 const frames=[];let running=true;
 const worker=(async()=>{while(running){const t=Date.now();try{const file=path.join(folder,String(frames.length).padStart(5,'0')+'.jpg');await writeFile(file,await page.screenshot({type:'jpeg',quality:75}));frames.push({file,time:t});}catch{/* Navigation can temporarily replace the rendering surface. */}await new Promise(resolve=>setTimeout(resolve,120));}})();
 let result;let stopped=false;
 const stop=async()=>{if(stopped)return result;stopped=true;running=false;await worker;assert.ok(frames.length>2,'Not enough real browser frames');
  const lines=frames.flatMap((f,i)=>[`file '${f.file.replaceAll('\\','/')}'`,`duration ${Math.max(.04,((frames[i+1]?.time||Date.now())-f.time)/1000)}`]);lines.push(`file '${frames.at(-1).file.replaceAll('\\','/')}'`);
  const manifest=path.join(folder,'frames.txt');await writeFile(manifest,lines.join('\n'));
  result=await encodeFrames(frames.map((f,i)=>({file:f.file,duration:Math.max(.04,((frames[i+1]?.time||Date.now())-f.time)/1000)})),name);return result;
 };stops.push(stop);return stop;
}
const chromium=await motionChromium(),browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report={recordings:[],transitionEvents:[],errors:[]};
try{
 if(!process.argv.includes('--project-only')){
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();
 await page.goto('http://localhost:3000/ar',{waitUntil:'networkidle',timeout:120000});await page.locator('.cinema-home[data-scroll-motion=true]').waitFor({state:'attached'});await page.waitForTimeout(1000);
 const stop=await startCapture(page,'cinematic-scroll');await page.waitForTimeout(500);
 for(let n=0;n<15;n++){await page.mouse.wheel(0,85);await page.waitForTimeout(120);}
 await page.screenshot({path:path.join(root,'screenshots','overlap.jpg'),quality:85});
 await page.locator('.cinema-story').scrollIntoViewIfNeeded();await page.waitForTimeout(400);
 for(let n=0;n<20;n++){await page.mouse.wheel(0,75);await page.waitForTimeout(130);}
 for(const id of ['portfolio','home-tools','home-products','home-subscriptions','home-hosting','home-careers']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(450);await page.screenshot({path:path.join(root,'screenshots',id+'.jpg'),quality:85});await page.mouse.wheel(0,180);await page.waitForTimeout(160);}
 await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(500);report.recordings.push(await stop());await context.close();console.log('Scroll recording saved');
 }else{
  const prior=JSON.parse(await readFile(path.join(root,'recordings','recording-evidence.json'),'utf8'));report.recordings.push(...prior.recordings.filter(r=>r.file.endsWith('cinematic-scroll.webm')));
 }
 // Warm the development-only fixture before filming; production deliberately returns 404.
 await fetch(`${labBase}/ar/motion-lab/blue-sass-study`).then(r=>r.text());
 const projects=await browser.newContext({viewport:{width:1440,height:900}});await projects.addInitScript(()=>{addEventListener('pageswap',e=>console.log('TRANSITION pageswap '+Boolean(e.viewTransition)));addEventListener('pagereveal',e=>console.log('TRANSITION pagereveal '+Boolean(e.viewTransition)));});
 const project=await projects.newPage();project.on('pageerror',e=>report.errors.push(e.message));project.on('console',m=>{if(m.text().startsWith('TRANSITION'))report.transitionEvents.push(m.text());});await project.goto(`${labBase}/ar/motion-lab`,{waitUntil:'networkidle',timeout:120000});
 assert.ok(await project.locator('h1').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=32,'Standalone portfolio heading has responsive display typography');
 const stopProject=await startCapture(project,'project-open-and-back');await project.waitForTimeout(650);await project.getByRole('link',{name:/Blue Sass \/ Internal Design Study/}).click({timeout:120000});await project.waitForURL('**/motion-lab/blue-sass-study',{timeout:120000});await project.waitForLoadState('networkidle');assert.equal(await project.locator('h1').innerText(),'Blue Sass / Internal Design Study');await project.waitForTimeout(700);await project.screenshot({path:path.join(root,'screenshots','project-detail.jpg'),quality:85});await project.mouse.wheel(0,250);await project.waitForTimeout(500);await project.goBack({waitUntil:'networkidle'});assert.ok(project.url().endsWith('/ar/motion-lab'));await project.waitForTimeout(800);report.recordings.push(await stopProject());await projects.close();
 assert.equal(report.errors.length,0,report.errors.join('\n'));const previous=JSON.parse(await readFile(path.join(root,'browser-results.json'),'utf8'));previous.earlierRunErrors=previous.errors;previous.errors=report.errors;previous.homeVideo='cinematic-scroll.webm';previous.projectVideo='project-open-and-back.webm';previous.interactions.push('Internal project document navigation and browser Back confirmed after route warmup and quarantining damaged development output');await writeFile(path.join(root,'browser-results.json'),JSON.stringify(previous,null,2));
}finally{for(const stop of stops)await stop().catch(()=>{});await browser.close();await writeFile(path.join(root,'recordings','recording-evidence.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
