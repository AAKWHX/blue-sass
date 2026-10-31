import {motionChromium} from './motion-browser-runtime.mjs';
import {writeFile,readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await browser.newPage({viewport:{width:390,height:844}});await p.goto('http://127.0.0.1:3000/ar',{waitUntil:'domcontentloaded'});await p.locator('.immersive-intro[data-started=true][data-ready=false]').waitFor({state:'attached'});
 await p.getByRole('button',{name:'إيقاف الحركة',exact:true}).click();await p.waitForTimeout(100);assert.equal(await p.locator('.immersive-intro').getAttribute('data-ready'),'true');
 const paused=await p.locator('.immersive-hero-content').evaluate(el=>({inert:el.inert,opacity:getComputedStyle(el).opacity}));assert.equal(paused.inert,false);assert.equal(Number(paused.opacity),1);assert.equal(await p.locator('main video').count(),0);
 await p.locator('#design-tab-1').click();assert.equal(await p.locator('#design-panel-1').evaluate(el=>getComputedStyle(el).opacity),'1');
 await p.reload({waitUntil:'domcontentloaded'});await p.getByRole('button',{name:'تخطي المقدمة',exact:true}).waitFor();await p.getByRole('button',{name:'تخطي المقدمة',exact:true}).click();assert.equal(await p.locator('.immersive-intro').getAttribute('data-ready'),'true');await p.waitForTimeout(1000);assert.equal(await p.locator('.immersive-hero-content').evaluate(el=>el.inert),false);
 await p.goto(pathToFileURL(path.resolve('packages/blue-sass-seal/preview.html')).href);assert.equal(await p.locator('.blue-sass-seal').count(),2);const sizes=await p.locator('.blue-sass-seal').evaluateAll(els=>els.map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,image:el.querySelector('img').naturalWidth})));assert.ok(sizes.every(s=>s.width>=200&&s.height>=90&&s.image>0));await p.screenshot({path:'artifacts/immersive-v2/screenshots/portable-seal.png',fullPage:true});
 assert.ok((await readFile('public/blue-sass-mark.svg')).equals(await readFile('packages/blue-sass-seal/blue-sass-mark.svg')));
 await writeFile('artifacts/immersive-v2/control-verification.json',JSON.stringify({passed:true,pauseDuringIntro:paused,pausedGallery:true,skipIntro:true,portableSeal:sizes,originalLogoPreserved:true},null,2));console.log('Pause, skip, gallery and portable seal passed');
}finally{await browser.close();}
