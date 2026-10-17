import { writeFile } from 'node:fs/promises';
import { motionChromium } from './motion-browser-runtime.mjs';
const browser = await (await motionChromium()).launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => {
    window.mobileMetrics = { lcp: null, layoutShift: 0, maxInteractionEventMs: null };
    new PerformanceObserver(list => { for (const e of list.getEntries()) window.mobileMetrics.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.mobileMetrics.layoutShift += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(list => { for (const e of list.getEntries()) if (e.interactionId) window.mobileMetrics.maxInteractionEventMs = Math.max(window.mobileMetrics.maxInteractionEventMs || 0, e.duration); }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
  await page.goto('http://localhost:3000/ar', { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(800);
  await page.locator('.cinema-service button').first().click();
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => ({ ...window.mobileMetrics, enhanced: document.querySelector('.cinema-home')?.dataset.enhanced, gsapGlobalPresent: Boolean(window.gsap), viewport: '390x844', context: 'Local production Chrome, no CPU/network throttling; viewport emulation, video intro enabled; viewport emulation only' }));
  await writeFile('artifacts/immersive-v2/mobile-performance.json', JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
