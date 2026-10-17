import {writeFile} from 'node:fs/promises';
import {motionChromium} from './motion-browser-runtime.mjs';
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto('http://localhost:3000/ar',{waitUntil:'domcontentloaded',timeout:60000});await page.locator('.bs-intro-skip').click();await page.waitForTimeout(1600);
 const sample=()=>page.evaluate(()=>new Promise(resolve=>{const times=[];let previous=performance.now(),count=0;const tick=now=>{times.push(now-previous);previous=now;if(++count<60)requestAnimationFrame(tick);else{times.sort((a,b)=>a-b);resolve({medianMs:times[30],p95Ms:times[57],frames:60});}};requestAnimationFrame(tick);}));
 const result={environment:'Desktop Chrome headless, 1440×900, no recording; not a physical phone benchmark',faces:await page.locator('.bs-infinity-face').count(),live:await sample()};
 await page.locator('.bs-metal-drift').evaluate(el=>el.getAnimations().forEach(animation=>animation.cancel()));result.static=await sample();
 await page.locator('.bs-metal-rotor').evaluate(el=>{el.hidden=true;});result.hidden=await sample();await writeFile('artifacts/discovery/performance.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
