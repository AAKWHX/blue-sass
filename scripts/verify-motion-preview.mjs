import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { motionChromium } from './motion-browser-runtime.mjs';
const out = 'artifacts/motion-preview';
await mkdir(`${out}/screenshots`, { recursive: true });
const browser = await (await motionChromium()).launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const report = { runs: [], errors: [], checks: [] };
const base = 'http://localhost:3002';
async function seek(page, fraction) {
  await page.locator('[data-motion-preview]').evaluate((el, f) => scrollTo({top:Number(el.dataset.start) + f*(Number(el.dataset.end)-Number(el.dataset.start)),behavior:'instant'}),fraction);
  await page.waitForTimeout(800);
}
try {
  for (const width of [390,814,1440]) for (const locale of ['ar','en','nl']) {
    const context = await browser.newContext({viewport:{width,height:900}});
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push(e.message));
    const response = await page.goto(`${base}/${locale}/motion-preview`, {waitUntil:'networkidle'});
    assert.equal(response.status(),200);
    await page.locator('[data-enhanced=true]').waitFor();
    const states=[];
    for (const f of [.05,.25,.4,.52,.65,.76,.88,.999,.25]) {
      await seek(page,f);
      const state=await page.locator('[data-motion-preview]').evaluate(el=>({
        progress:el.dataset.progress, scene:el.dataset.scene,service:el.dataset.service,project:el.dataset.project,
        pinTop:el.querySelector('.mp-stage').getBoundingClientRect().top,
        pinPosition:getComputedStyle(el.querySelector('.mp-stage')).position,
        track:getComputedStyle(el.querySelector('.mp-project-track')).transform,
        card:getComputedStyle(el.querySelector('[data-service-card="0"]')).transform,
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        triggers:el.dataset.triggerCount,
        activeVideos:el.querySelectorAll('video').length,
      }));
      assert.equal(state.overflow,false,`${width}/${locale} overflow`);
      assert.equal(state.triggers,'1'); assert.ok(state.activeVideos<=1);
      states.push(state);
      if(locale==='ar' && [.05,.25,.76,.999].includes(f)) await page.screenshot({path:`${out}/screenshots/${width}-${state.scene}.png`});
    }
    assert.equal(states[0].scene,'0');assert.equal(states[1].scene,'1');assert.equal(states[4].scene,'2');assert.equal(states[7].scene,'3');assert.equal(states[8].scene,'1');
    assert.equal(states[1].pinPosition,'fixed');assert.ok(Math.abs(states[1].pinTop-states[5].pinTop)<2);
    assert.notEqual(states[1].card,states[3].card);assert.notEqual(states[4].track,states[6].track);
    // Keyboard activation and real browser history through the nested route.
    await seek(page,.64);
    const link=page.locator('[data-study="0"] a');await link.focus();await page.keyboard.press('Enter');
    await page.waitForURL('**/project/responsive-experience');await page.waitForTimeout(800);
    assert.ok(await page.locator('.mp-detail h1').evaluate(el=>el===document.activeElement));
    await page.goBack({waitUntil:'networkidle'});await page.locator('[data-enhanced=true]').waitFor();await page.waitForTimeout(800);
    assert.equal(await page.locator('[data-motion-preview]').getAttribute('data-trigger-count'),'1');
    await page.locator('.mp-toggle').click();await page.waitForTimeout(750);
    assert.equal(await page.locator('[data-motion-preview]').getAttribute('data-enhanced'),null);
    assert.equal(await page.locator('.mp-panel[inert]').count(),0);
    await page.locator('.mp-toggle').click();await page.locator('[data-enhanced=true]').waitFor();
    report.runs.push({width,locale,states,keyboardNavigation:true,historyBack:true,pauseResume:true});
    await context.close();console.log(`Passed ${width}/${locale}`);
  }
  for (const mode of ['reduced','no-js']) {
    const context=await browser.newContext({viewport:{width:390,height:844}, reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'});
    const page=await context.newPage();await page.goto(`${base}/ar/motion-preview`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('[data-enhanced=true]').count(),0);assert.equal(await page.locator('.mp-panel[inert]').count(),0);
    assert.equal(await page.locator('[data-motion-preview] video').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    report.checks.push(`${mode}: readable natural document flow, no pinned panels or video`);await context.close();
  }
  assert.equal((await fetch('http://localhost:3000/ar/motion-preview')).status,404);
  assert.equal((await fetch(`${base}/ar/motion-preview/project/unknown`)).status,404);
  report.checks.push('Normal production-mode server returns 404; unknown study returns 404');
  assert.equal(report.errors.length,0,report.errors.join('\n'));
} finally { await writeFile(`${out}/browser-results.json`,JSON.stringify(report,null,2));await browser.close(); }
