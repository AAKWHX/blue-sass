import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { motionChromium } from './motion-browser-runtime.mjs';

const phase = process.argv.includes('--after') ? 'after' : 'before';
const out = path.resolve('artifacts/content-cleanup');
await mkdir(path.join(out, 'screenshots'), { recursive: true });
const browser = await (await motionChromium()).launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const routes = ['', 'services', ...['web','android','ios','windows','store','erp','ai','design'].map(s => 'services/' + s), 'projects', 'about', 'contact', 'reviews', 'products', 'subscriptions', 'hosting', 'jobs', 'marketplace', 'tools', ...['qr-code-generator','invoice-generator','seo-checker','message-checker'].map(s => 'tools/' + s), 'login', 'register', 'create-project'];
const results = process.argv.includes('--resume') ? JSON.parse(await readFile(path.join(out,`layout-${phase}.json`),'utf8')) : { phase, cases: [], pageErrors: [], consoleErrors: [] };
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', e => results.pageErrors.push({ url: page.url(), error: e.message }));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_NETWORK_ACCESS_DENIED|ERR_BLOCKED_BY_CLIENT/.test(m.text())) results.consoleErrors.push({ url: page.url(), error: m.text() }); });
  const cases = routes.flatMap(route => [375,768,1440].map(width => ({ locale: 'ar', route, width })));
  for (const locale of ['en','nl']) for (const route of ['', 'services', 'services/web', 'tools', 'contact']) for (const width of [375,1440]) cases.push({ locale, route, width });
  cases.push({ locale: 'ar', route: '', width: 1920 });
  for (const item of cases.slice(results.cases.length)) {
    await page.setViewportSize({ width: item.width, height: item.width < 600 ? 844 : 1000 });
    const response = await page.goto(`http://localhost:3000/${item.locale}/${item.route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('main').waitFor({state:'visible'});
    await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,3000))]));
    await page.waitForTimeout(350);
    const state = await page.evaluate(() => {
      const visible = e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[aria-hidden=true],[hidden],[inert]');
      const controls = [...document.querySelectorAll('main button,main a,main input,main select,main textarea')].filter(visible);
      const clipped = controls.filter(e => { const s = getComputedStyle(e); return e.scrollWidth > e.clientWidth + 3 && /hidden|clip/.test(s.overflowX) && s.whiteSpace === 'nowrap'; }).map(e => ({ tag: e.tagName, text: e.textContent.trim().slice(0,100), class: e.className }));
      const unnamed = controls.filter(e => e.tagName === 'BUTTON' && !e.textContent.trim() && !e.getAttribute('aria-label') && !e.getAttribute('aria-labelledby') && !e.getAttribute('title')).map(e => ({ html: e.outerHTML.slice(0,250) }));
      const horizontalOverflow = document.documentElement.scrollWidth > innerWidth + 1;
      const outliers = horizontalOverflow ? [...document.querySelectorAll('main *')].filter(e => { if (!visible(e)) return false; const r=e.getBoundingClientRect(); return r.right > innerWidth + 2 || r.left < -2; }).slice(-16).map(e => ({ tag: e.tagName, class: String(e.className).slice(0,120), text: e.textContent.trim().slice(0,60), left: e.getBoundingClientRect().left, right: e.getBoundingClientRect().right })) : [];
      return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, horizontalOverflow, clipped, unnamed, h1: [...document.querySelectorAll('main h1')].map(e => e.textContent.trim()), outliers };
    });
    results.cases.push({ ...item, status: response.status(), finalUrl: page.url(), ...state });
    if (['', 'services/web', 'tools', 'contact', 'hosting'].includes(item.route) && [375,1440].includes(item.width) && item.locale === 'ar') await page.screenshot({ path: path.join(out,'screenshots',`${phase}-${item.route.replaceAll('/','-') || 'home'}-${item.width}.jpg`), quality: 80, fullPage: true });
    if (state.horizontalOverflow || state.clipped.length || state.unnamed.length || response.status() >= 400) console.log('ISSUE',JSON.stringify(results.cases.at(-1)));
    if (results.cases.length % 15 === 0) console.log(`Audited ${results.cases.length}/${cases.length}`);
  }
} finally {
  await writeFile(path.join(out,`layout-${phase}.json`),JSON.stringify(results,null,2));
  await browser.close();
}
console.log(JSON.stringify({ phase, count:results.cases.length, overflow:results.cases.filter(c=>c.horizontalOverflow).length, clipped:results.cases.filter(c=>c.clipped.length).length, unnamed:results.cases.filter(c=>c.unnamed.length).length, pageErrors:results.pageErrors.length }));
