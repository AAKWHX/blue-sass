import {writeFile} from 'node:fs/promises';import {motionChromium} from './motion-browser-runtime.mjs';
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto('http://localhost:3000/ar');await page.locator('.bs-intro-skip').click();await page.waitForTimeout(1200);
 const sample=()=>page.evaluate(()=>new Promise(resolve=>{const times=[];let previous=performance.now(),count=0;const tick=now=>{times.push(now-previous);previous=now;if(++count<40)requestAnimationFrame(tick);else{times.sort((a,b)=>a-b);resolve({medianMs:times[20],p95Ms:times[38]});}};requestAnimationFrame(tick);}));
 await page.locator('.bs-infinity-face').evaluateAll(nodes=>nodes.forEach(node=>{node.style.clipPath='none';}));const result={withoutClip:await sample()};await page.screenshot({path:'artifacts/discovery/infinity-no-clip.png'});
 await page.locator('.bs-metal-control').evaluate(node=>{node.style.contain='paint';node.style.isolation='isolate';});result.contained=await sample();
 await page.locator('.bs-infinity-face').evaluateAll(nodes=>nodes.forEach((node,i)=>{if(i%4!==0)node.remove();}));result.fewerFaces=await sample();await writeFile('artifacts/discovery/performance-variants.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
