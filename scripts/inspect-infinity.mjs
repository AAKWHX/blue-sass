import {readFile,writeFile} from 'node:fs/promises';
import ts from 'typescript';
import vm from 'node:vm';
import {motionChromium} from './motion-browser-runtime.mjs';
const source=await readFile('lib/infinity-geometry.ts','utf8');const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const context={exports:{}};vm.runInNewContext(compiled,context);
const faces=context.exports.infinitySurfaces.map(style=>`<i class="bs-infinity-face" style="${Object.entries(style).map(([key,value])=>`${key.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase())}:${typeof value==='number'?value+'px':value}`).join(';')}"></i>`).join('');
const css=await readFile('components/public/interactive-metal.css','utf8');
const browser=await(await motionChromium()).launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const page=await browser.newPage({viewport:{width:800,height:600}});await page.setContent(`<style>${css}body{margin:0;background:#07090f}.bs-metal-stage{width:800px;height:600px}.bs-metal-control{inset:0!important;transform:scale(1.4)!important}</style><div class="bs-metal-stage"><div class="bs-metal-light bs-metal-light-blue"></div><div class="bs-metal-light bs-metal-light-purple"></div><div class="bs-metal-control"><div class="bs-metal-rotor"><div class="bs-metal-drift">${faces}</div></div></div></div>`);await page.screenshot({path:'artifacts/discovery/infinity-detail.png'});await writeFile('artifacts/discovery/infinity-detail.html',await page.content());}finally{await browser.close();}
