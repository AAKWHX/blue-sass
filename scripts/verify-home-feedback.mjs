import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {motionChromium} from './motion-browser-runtime.mjs';
const out='artifacts/home-feedback';await mkdir(`${out}/screenshots`,{recursive:true});
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results={cases:[],errors:[]};
try{
 for(const [width,locale] of (process.env.BS_FEEDBACK_QUICK?[[390,'ar'],[1440,'ar']]:[[390,'ar'],[702,'ar'],[856,'ar'],[1440,'ar'],[856,'en'],[856,'nl']])){
  const page=await browser.newPage({viewport:{width,height:676}});page.on('pageerror',error=>results.errors.push(error.message));
  await page.addInitScript(()=>{window.soundContexts=[];window.soundGains=[];window.voiceCount=0;const Base=window.AudioContext;window.AudioContext=class extends Base{constructor(...args){super(...args);window.soundContexts.push(this);}createGain(){const gain=super.createGain();window.soundGains.push(gain);return gain;}createOscillator(){window.voiceCount++;return super.createOscillator();}};});
  await page.goto(`http://localhost:3000/${locale}`,{waitUntil:'domcontentloaded'});await page.locator('.bs-brand-intro').waitFor();await page.keyboard.press('Escape');await page.locator('.bs-brand-intro').waitFor({state:'detached'});await page.waitForTimeout(1200);
  assert.equal(await page.locator('.bs-metal-audio').count(),0);assert.equal(await page.evaluate(()=>window.soundContexts.length),0);
  await page.waitForFunction(()=>document.querySelector('.cinema-home').dataset.scrollMotion==='true');
  assert.ok(await page.locator('.bs-metal-drift').evaluate(node=>node.getAnimations().length)>0);
  const control=page.locator('.bs-metal-control');await control.focus();await page.keyboard.down('Enter');await page.waitForTimeout(250);await page.keyboard.up('Enter');assert.equal(await page.evaluate(()=>window.voiceCount),5);await page.waitForTimeout(900);assert.ok(await page.evaluate(()=>window.soundGains[0].gain.value)<.0001);
  await control.evaluate(node=>node.blur());if(locale==='ar')await page.screenshot({path:`${out}/screenshots/hero-${width}.png`});
  const story=page.locator('.cinema-story-sticky');const storyY=await story.evaluate(node=>node.getBoundingClientRect().top+scrollY);
  await page.evaluate(y=>scrollTo(0,y-innerHeight*.64),storyY);await page.waitForTimeout(1000);const circleStart=await page.locator('.bs-story-circle').evaluate(node=>new DOMMatrix(getComputedStyle(node).transform).a);
  if(locale==='ar')await page.screenshot({path:`${out}/screenshots/circle-start-${width}.png`});
  await page.evaluate(y=>scrollTo(0,y-80),storyY);await page.waitForTimeout(1300);const circleEnd=await page.locator('.bs-story-circle').evaluate(node=>new DOMMatrix(getComputedStyle(node).transform).a);assert.ok(circleEnd>circleStart+1);assert.ok(Number(await page.locator('.bs-story-content').evaluate(node=>getComputedStyle(node).opacity))>.95);
  if(locale==='ar')await page.screenshot({path:`${out}/screenshots/process-${width}.png`});
  const tools=page.locator('#home-tools .bs-more-tools a');assert.equal(await tools.count(),8);for(const link of await tools.all())assert.ok((await link.getAttribute('href')).startsWith(`/${locale}/tools`));
  const gallery=page.locator('.bs-template-gallery');const stageY=await gallery.locator('.immersive-gallery-stage').evaluate(node=>node.getBoundingClientRect().top+scrollY);await page.evaluate(y=>scrollTo(0,y-innerHeight*.5),stageY);await page.waitForTimeout(1400);await page.locator('#design-tab-0').click();
  if(process.env.BS_FEEDBACK_QUICK)assert.equal(await gallery.locator('.immersive-gallery-stage').evaluate(node=>getComputedStyle(node).overflow),'hidden');
  // Restore the stage after a tab's native focus scroll, then use actual vertical scrolling.
  await page.evaluate(y=>scrollTo(0,y-innerHeight*.5),stageY);await page.waitForTimeout(1400);
  await page.mouse.wheel(0,210);await page.waitForTimeout(1300);const forward=Number(await gallery.getAttribute('data-index'));assert.ok(forward>=1,'downward scroll changes the template');
  await page.mouse.wheel(0,-210);await page.waitForTimeout(1300);const backward=Number(await gallery.getAttribute('data-index'));assert.ok(backward<forward,'upward scroll reverses the template');
  assert.equal(await gallery.locator('.bs-gallery-caption strong').innerText(),await gallery.locator('.bs-template-content h3').innerText());
  const badges=page.locator('#home-discover .bs-discovery-badges a');assert.equal(await badges.count(),8);assert.equal(await badges.locator('svg').count(),8);
  await page.locator('#home-discover').scrollIntoViewIfNeeded();if(locale==='ar')await page.screenshot({path:`${out}/screenshots/discover-${width}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  results.cases.push({width,locale,noSoundButton:true,gestureOnlyFiveVoices:true,silenceAfterRelease:true,idleMotion:true,circleStart,circleEnd,extraTools:8,discoverySymbols:8,scrollGallery:{forward,backward}});await page.close();console.log(`Passed ${width}/${locale}`);
 }
 const page=await browser.newPage({viewport:{width:390,height:676},reducedMotion:'reduce'});await page.goto('http://localhost:3000/ar',{waitUntil:'domcontentloaded'});await page.locator('.bs-brand-intro').waitFor();await page.keyboard.press('Escape');await page.waitForTimeout(500);assert.equal(await page.locator('.bs-metal-drift').evaluate(node=>node.getAnimations().length),0);assert.equal(await page.locator('.bs-story-circle').evaluate(node=>getComputedStyle(node).display),'none');assert.equal(await page.locator('.bs-story-content').evaluate(node=>getComputedStyle(node).opacity),'1');results.reducedMotion=true;await page.close();assert.deepEqual(results.errors,[]);
}finally{await writeFile(`${out}/${process.env.BS_FEEDBACK_QUICK?'final-results':'results'}.json`,JSON.stringify(results,null,2));await browser.close();}
