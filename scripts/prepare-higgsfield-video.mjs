import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { motionChromium } from './motion-browser-runtime.mjs';

const source='public/media/higgsfield/hero-titanium-v1.mp4';
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
  const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;const context=canvas.getContext('2d',{alpha:false});context.drawImage(video,0,0);
  const mime='video/webm;codecs=vp9';if(!MediaRecorder.isTypeSupported(mime))throw Error('VP9 encoder unavailable');
  const stream=canvas.captureStream(24),recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:1200000});const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  const reverseFrames=[canvas.toDataURL('image/jpeg',.94)];
  const stopped=new Promise(resolve=>{recorder.onstop=resolve;});let frames=0;
  const draw=()=>{context.drawImage(video,0,0);reverseFrames.push(canvas.toDataURL('image/jpeg',.94));frames++;if(!video.ended)video.requestVideoFrameCallback(draw);};
  recorder.start();video.requestVideoFrameCallback(draw);await video.play();await Promise.race([new Promise(resolve=>video.onended=resolve),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Source playback did not finish')),20000))]);
  // Return through the same real frames so the loop meets its original pose, without a paid regeneration.
  const reverseStarted=performance.now();let reversed=0;
  for(let i=reverseFrames.length-2;i>=0;i--){const bitmap=await createImageBitmap(await(await fetch(reverseFrames[i])).blob());context.drawImage(bitmap,0,0);bitmap.close();reversed++;await new Promise(resolve=>setTimeout(resolve,Math.max(0,reverseStarted+reversed*1000/24-performance.now())));}
  recorder.stop();await stopped;stream.getTracks().forEach(track=>track.stop());
  const blob=new Blob(chunks,{type:mime}),buffer=new Uint8Array(await blob.arrayBuffer());let binary='';for(let offset=0;offset<buffer.length;offset+=32768)binary+=String.fromCharCode(...buffer.subarray(offset,offset+32768));
  return {base64:btoa(binary),frames,reversedFrames:reversed,loopMethod:'Forward source frames followed by the same frames in reverse; no generated intermediate frames',width:video.videoWidth,height:video.videoHeight,sourceDuration:video.duration,mime};
 });
 assert.ok(encoded.frames>=90,'Enough actual video frames must be decoded');
 const target='public/media/higgsfield/hero-titanium-v1.webm';await writeFile(target,Buffer.from(encoded.base64,'base64'));delete encoded.base64;
 const evidence={...encoded,sourceBytes:bytes,webmBytes:(await stat(target)).size,method:'Chrome decoded the original Higgsfield video and re-encoded real canvas video frames with MediaRecorder VP9; no generated intermediate frames or added audio.'};
 for(const seconds of [0,2.5,4.9]){
  const png=await page.evaluate(async t=>{const v=document.getElementById('source');if(Math.abs(v.currentTime-t)>.01){v.currentTime=t;await new Promise(resolve=>v.onseeked=resolve);}const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);return c.toDataURL('image/png').split(',')[1];},seconds);
  await writeFile(`artifacts/higgsfield-production/video-frame-${seconds}.png`,Buffer.from(png,'base64'));
 }
 await writeFile('artifacts/higgsfield-production/video-preparation.json',JSON.stringify(evidence,null,2));console.log(evidence);
 await readFile(target);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
