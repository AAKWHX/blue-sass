import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
const base = process.env.QA_ORIGIN || "http://localhost:3017";
const tabs = await (await fetch("http://localhost:9225/json")).json();
const tab = tabs.find(tab => tab.type === "page");
assert.ok(tab, "Chrome tab available");
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener("open", resolve, { once: true }));
let sequence = 0; const pending = new Map(); const errors = [];
ws.addEventListener("message", event => { const data = JSON.parse(event.data); if (data.id) { const p = pending.get(data.id); pending.delete(data.id); if(data.error) p.reject(data.error); else p.resolve(data.result); } if(data.method === "Runtime.exceptionThrown") errors.push(data.params.exceptionDetails.text); });
function send(method, params = {}) { return new Promise((resolve,reject) => { const id = ++sequence; pending.set(id,{resolve,reject}); ws.send(JSON.stringify({id,method,params})); }); }
async function evaluate(expression) { const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if(result.exceptionDetails) throw Error(result.exceptionDetails.text); return result.result.value; }
const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
await send("Page.enable"); await send("Runtime.enable");
async function navigate(path, width = 1440) {
 await send("Emulation.setDeviceMetricsOverride", { width, height: 960, deviceScaleFactor: 1, mobile: width < 600 });
 await send("Page.navigate", { url: base + path });
 for(let i=0;i<50;i++) { await delay(150); if(await evaluate("document.readyState === 'complete'")) break; }
 await delay(800);
 assert.ok(await evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), `No horizontal overflow ${path} @${width}`);
}
async function click(selector) {
 const box = await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if(!e) return null; const r = e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
 assert.ok(box,selector); await send("Input.dispatchMouseEvent",{type:"mousePressed",button:"left",clickCount:1,...box}); await send("Input.dispatchMouseEvent",{type:"mouseReleased",button:"left",clickCount:1,...box}); await delay(250);
}
const checks=[];
for(const width of [320,390,768,1280,1440,1920]) {
 await navigate("/ar", width);
 for(const scroll of [0,1600]) {
  await evaluate(`window.scrollTo({top:${scroll},behavior:'instant'})`); await delay(200);
  const before = await evaluate("scrollY");
  await click('header button[aria-haspopup="menu"]');
  const result = await evaluate(`(() => {const h=document.querySelector('header').getBoundingClientRect();const m=document.querySelector('[role=menu]')?.getBoundingClientRect();return {header:h.top,menu:m?{x:m.x,y:m.y,bottom:m.bottom,right:m.right}:null,scroll:scrollY,width:innerWidth,height:innerHeight};})()`);
  assert.ok(result.menu, "Language menu opens"); assert.ok(Math.abs(result.header)<2,"Header stays pinned"); assert.ok(Math.abs(result.scroll-before)<2,"No scroll jump"); assert.ok(result.menu.x>=-2 && result.menu.right<=result.width+2 && result.menu.bottom<=result.height+2,"Menu visible in viewport");
  await send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape",windowsVirtualKeyCode:27}); await send("Input.dispatchKeyEvent",{type:"keyUp",key:"Escape",code:"Escape",windowsVirtualKeyCode:27}); await delay(150);
  checks.push(`language ${width} scroll ${scroll}`);
 }
 await navigate("/ar/templates",width);
 assert.equal(await evaluate("document.querySelectorAll('#templates article').length"),16);
 await evaluate("document.querySelector('#templates article button').scrollIntoView({block:'center',behavior:'instant'})"); await delay(100);
 await click('#templates article button');
 assert.ok(await evaluate("!!document.querySelector('[role=dialog]')"));
 assert.ok(await evaluate("document.querySelector('[role=dialog]').scrollWidth <= document.querySelector('[role=dialog]').clientWidth + 2"));
 if(width === 390) {const shot=await send("Page.captureScreenshot",{format:"png"});await writeFile(join(tmpdir(),"blue-sass-template-mobile.png"),Buffer.from(shot.data,"base64"));}
 checks.push(`templates/modal ${width}`);
 await navigate("/ar/subscriptions",width); checks.push(`subscriptions ${width}`);
 await navigate("/ar/pricing",width);
 assert.equal(await evaluate("document.querySelectorAll('[data-package]').length"),19);
 const href = await evaluate("document.querySelector('[data-package=landing] a').getAttribute('href')");
 assert.equal(href,"/ar/quote?kind=landing&type=web");
 if(width===390) {const shot=await send("Page.captureScreenshot",{format:"png"});await writeFile(join(tmpdir(),"blue-sass-pricing-mobile.png"),Buffer.from(shot.data,"base64"));}
 checks.push(`pricing ${width}`);
}
for(const locale of ["en","nl","de","tr","fr","es"]) { await navigate(`/${locale}/templates`,390); assert.equal(await evaluate("document.querySelectorAll('#templates article').length"),16);checks.push(`templates ${locale}`); }
for(const locale of ["en","nl","de","tr","fr","es"]) { await navigate(`/${locale}/pricing`,390); assert.equal(await evaluate("document.querySelectorAll('[data-package]').length"),19);checks.push(`pricing ${locale}`); }
await navigate("/ar/templates?group=apps",1440); assert.equal(await evaluate("document.querySelectorAll('#templates article').length"),10);
await navigate("/ar/templates?group=web",1440); assert.equal(await evaluate("document.querySelectorAll('#templates article').length"),6);
await navigate("/ar/services/web",1440); assert.equal(await evaluate("document.querySelectorAll('#templates article').length"),2);
const shot=await send("Page.captureScreenshot",{format:"png"});await writeFile(join(tmpdir(),"blue-sass-service-desktop.png"),Buffer.from(shot.data,"base64"));
assert.equal(errors.length,0,JSON.stringify(errors));
console.log(JSON.stringify({checks,errors},null,2)); ws.close();
