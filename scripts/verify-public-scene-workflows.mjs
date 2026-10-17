import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
import {motionChromium} from './motion-browser-runtime.mjs';
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const result={routes:[],checks:[],errors:[]};
try{
 const page=await browser.newPage({viewport:{width:390,height:676}});page.on('pageerror',e=>result.errors.push(e.message));
 for(const locale of ['en','nl'])for(const route of ['services','services/web','services/ai','about','products','subscriptions','hosting','jobs','marketplace','create-project','tools','contact','reviews']){
  const response=await page.goto(`http://localhost:3000/${locale}/${route}`,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);assert.ok(await page.locator('main h1').count());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);result.routes.push(`${locale}/${route}`);
 }
 await page.goto('http://localhost:3000/ar/tools',{waitUntil:'domcontentloaded'});const count=await page.locator('main a.tool-card').count();await page.locator('main input').fill('QR');assert.ok((await page.locator('main a.tool-card').count())<count);await page.locator('main input').fill('');assert.equal(await page.locator('main a.tool-card').count(),count);result.checks.push('Tool directory search and reset remain functional');
 await page.goto('http://localhost:3000/ar/tools/qr-code-generator',{waitUntil:'domcontentloaded'});await page.locator('#qr-data').fill('https://www.bluesass.nl/ar');await page.locator('form button[type=submit]').click();await page.locator('form img[alt=QR]').waitFor();assert.equal(await page.locator('form').evaluate(el=>getComputedStyle(el).transform),'none');result.checks.push('QR generated locally; form remains untransformed');
 await page.goto('http://localhost:3000/ar/login',{waitUntil:'domcontentloaded'});assert.equal(await page.locator('.bs-public-motion').count(),0);assert.equal(await page.locator('.pin-spacer').count(),0);result.checks.push('Login excluded from public scroll enhancement');
 assert.deepEqual(result.errors,[]);
}finally{await writeFile('artifacts/motion-integration/workflow-results.json',JSON.stringify(result,null,2));await browser.close();}
console.log(`Passed ${result.routes.length} locale routes, tools search, QR and login isolation`);

