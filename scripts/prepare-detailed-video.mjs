import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { motionChromium } from './motion-browser-runtime.mjs';

const name=process.argv[2]; if(!['workflow','web-showcase','product-ui','monitoring'].includes(name)) throw Error('Choose a known immersive asset');
const source=`artifacts/immersive-v2/originals/${name}.mp4`;
const outputDir=`artifacts/visual-polish/video/${name}`; await (await import('node:fs/promises')).mkdir(outputDir,{recursive:true});
const bytes=(await stat(source)).size;
const server=createServer((request,response)=>{
 if(request.url==='/source.mp4'){
  const match=request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if(match){const start=Number(match[1]),end=match[2]?Number(match[2]):bytes-1;response.writeHead(206,{'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${bytes}`,'Content-Length':end-start+1});createReadStream(source,{start,end}).pipe(response);}
  else{response.writeHead(200,{'Content-Type':'video/mp4','Content-Length':bytes,'Accept-Ranges':'bytes'});createReadStream(source).pipe(response);}
 }else{response.writeHead(200,{'Content-Type':'text/html'});response.end('<!doctype html><html><body style="margin:0;background:black"><video id="source" src="/source.mp4" muted playsinline preload="auto" style="width:100%"></video></body></html>');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}});await page.goto(`http://127.0.0.1:${server.address().port}`);
 const encoded=await page.evaluate(async()=>{
  const video=document.getElementById('source');if(video.readyState<2)await new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=reject;});
  const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;const context=canvas.getContext('2d',{alpha:false});
  const frames=[]; const count=Math.floor(video.duration*24);
  for(let i=0;i<count;i++){const time=Math.min(video.duration-.04,i/24); if(Math.abs(video.currentTime-time)>.001){video.currentTime=time;await new Promise(resolve=>video.onseeked=resolve);}context.drawImage(video,0,0);frames.push(canvas.toDataURL('image/jpeg',.94).split(',')[1]);}
  return {frames,width:video.videoWidth,height:video.videoHeight,sourceDuration:video.duration};
 });
 assert.ok(encoded.frames.length>=Math.floor(encoded.sourceDuration*23),'All source timestamps must be decoded');
 const target=`public/media/immersive-v2/${name}.webm`;
 const frames=encoded.frames; const sequence=[...frames,...frames.slice(1,-1).reverse()];
 const ffmpeg=spawn(path.join(process.env.LOCALAPPDATA,'ms-playwright/ffmpeg-1013/ffmpeg-win64.exe'),['-y','-f','image2pipe','-framerate','24','-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libvpx-vp9','-b:v','2200k','-crf','20','-deadline','good','-cpu-used','6',target],{windowsHide:true});
 let errors='';ffmpeg.stderr.on('data',chunk=>{errors+=chunk.toString();});
 const done=new Promise((resolve,reject)=>{ffmpeg.on('error',reject);ffmpeg.on('exit',code=>code===0?resolve():reject(Error(errors)));});
 for(const frame of sequence){if(!ffmpeg.stdin.write(Buffer.from(frame,'base64')))await new Promise(resolve=>ffmpeg.stdin.once('drain',resolve));}ffmpeg.stdin.end();await done;
 const evidence={width:encoded.width,height:encoded.height,sourceDuration:encoded.sourceDuration,frames:frames.length,outputFrames:sequence.length,fps:24,sourceBytes:bytes,webmBytes:(await stat(target)).size,method:'Chrome seeks every source timestamp at 24 fps; FFmpeg VP9 encodes those real decoded JPEG frames forward then reverse. No generated intermediate frames, no audio.'};
 for(const seconds of [0,encoded.sourceDuration/2,encoded.sourceDuration-.12]){
  const png=await page.evaluate(async t=>{const v=document.getElementById('source');if(Math.abs(v.currentTime-t)>.01){v.currentTime=t;await new Promise(resolve=>v.onseeked=resolve);}const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);return c.toDataURL('image/png').split(',')[1];},seconds);
  await writeFile(`${outputDir}/video-frame-${seconds.toFixed(2)}.png`,Buffer.from(png,'base64'));
 }
 await writeFile(`${outputDir}/video-preparation.json`,JSON.stringify(evidence,null,2));console.log(evidence);
 await readFile(target);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}

