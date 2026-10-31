import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { motionChromium } from './motion-browser-runtime.mjs';
const chromium=await motionChromium();
const out=path.resolve('artifacts/motion-redesign/references');await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
for(const [name,url,menu] of [['format','https://format-3.co/','Menu'],['locomotive','https://locomotive.ca/en','Navigation mobile'],['resn','https://www.resn.co.nz/',null],['basement','https://basement.studio/','Open menu']]) {
 const item={name,url,scrolls:[],notes:[]};results.push(item);
 const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out,size:{width:1440,height:900}}});const page=await context.newPage();
 try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});item.status=response?.status();
  await page.screenshot({path:path.join(out,name+'-initial.jpg'),quality:80});await page.waitForTimeout(2500);
  for(const label of ['Decline','Accept Necessary']){const cookie=page.getByRole('button',{name:label,exact:true});if(await cookie.count()&&await cookie.isVisible())await cookie.click();}
  await page.screenshot({path:path.join(out,name+'-loaded.jpg'),quality:85});
  item.visibleMotion=await page.evaluate(()=>({canvases:document.querySelectorAll('canvas').length,videos:[...document.querySelectorAll('video')].map(v=>({paused:v.paused,readyState:v.readyState,muted:v.muted})),animations:document.getAnimations().filter(a=>a.playState==='running').slice(0,10).map(a=>({target:a.effect?.target?.tagName,name:a.animationName||'web-animation'}))}));
  for(let i=0;i<12;i++){await page.mouse.wheel(0,650);await page.waitForTimeout(160);item.scrolls.push(await page.evaluate(()=>({y:scrollY,height:document.documentElement.scrollHeight,headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>{const r=e.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}).map(e=>e.innerText).slice(0,5)})));if([1,5,11].includes(i))await page.screenshot({path:path.join(out,`${name}-sweep-${i}.jpg`),quality:80});}
  const targets=await page.locator('a[href*="/work/"],a[href*="/showcase/"]').all();let project;
  for(const target of targets){if(await target.isVisible()){project=target;break;}}
  if(project){item.projectHref=await project.getAttribute('href');await project.hover();await page.waitForTimeout(250);await page.screenshot({path:path.join(out,name+'-hover.jpg'),quality:85});await project.click({timeout:15000});await page.waitForTimeout(1800);item.projectURL=page.url();await page.screenshot({path:path.join(out,name+'-detail.jpg'),quality:85});if(page.url()!==url){await page.goBack({waitUntil:'domcontentloaded'});await page.waitForTimeout(700);item.backURL=page.url();}}
  else item.notes.push('No visible semantic project link available to automate.');
  await page.setViewportSize({width:390,height:844});await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(1800);await page.screenshot({path:path.join(out,name+'-phone.jpg'),quality:85});
  if(menu){const button=page.getByRole('button',{name:menu,exact:true});if(await button.count()){await button.click();await page.waitForTimeout(700);await page.screenshot({path:path.join(out,name+'-phone-menu.jpg'),quality:85});item.menuOpened=true;const close=page.getByRole('button',{name:/^Close( menu)?$/});if(await close.count())await close.first().click();else await button.click();item.menuCloseAttempted=true;}else item.notes.push('Named menu control unavailable in this render.');}
  if(name==='resn')item.notes.push('Canvas scene: semantic DOM cannot identify all interactive controls; no inferred hover/project transitions recorded.');
 }catch(error){item.error=error.message;}finally{item.recording=path.basename(await page.video().path());await context.close();await writeFile(path.join(out,'inspection.json'),JSON.stringify(results,null,2));}
}
await browser.close();console.log(JSON.stringify(results,null,2));
