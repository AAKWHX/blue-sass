import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { load } from './test-typescript-loader.mjs';
import { CMP_ENABLED, ADS_ENABLED, CMP_SCRIPT_SOURCE } from '../lib/cmp-policy.mjs';
import { publicContentSecurityPolicy } from '../lib/cmp-csp.mjs';

const source = fs.readFileSync('public/cmp-bootstrap.js', 'utf8');
const fields = ['ad_storage','analytics_storage','ad_user_data','ad_personalization'];
const denied = Object.fromEntries(fields.map(k=>[k,'denied']));
function fixture() {
  const document = { documentElement:{dataset:{}}, body:{appendChild(){}}, createElement:()=>({style:{}}) };
  const window = { frames:{googlefcPresent:{}}, dataLayer:[] };
  const context = vm.createContext({window,document,setTimeout:()=>{throw Error('Unexpected timer');}});
  vm.runInContext(source,context);
  const entries=()=>window.dataLayer.map(args=>Array.from(args));
  const callback=key=>window.googlefc.callbackQueue.find(row=>row[key])?.[key];
  return {document,window,context,entries,callback};
}

test('CMP and advertising capabilities are independent, publisher tag is the account-provided one',()=>{
  assert.equal(CMP_ENABLED,true);assert.equal(ADS_ENABLED,false);
  assert.equal(CMP_SCRIPT_SOURCE,'https://fundingchoicesmessages.google.com/i/pub-2458310650397376?ers=1');
  assert.equal(load('lib/advertising.ts').isAdsenseRuntimeEnabled,false);
  assert.equal(load('components/adsense.tsx').AdSense(),null);
});

test('all four purposes default to denied before CMP callbacks; no config or analytics commands',()=>{
  const f=fixture(),entries=f.entries();
  assert.deepEqual(entries[0].slice(0,2),['consent','default']);
  for(const field of fields)assert.equal(entries[0][2][field],'denied');
  assert.equal(f.document.documentElement.dataset.blueSassCmpReady,'false');
  assert.ok(entries.every(row=>row[0]==='consent'||row[0]==='set'));
  assert.doesNotMatch(source,/localStorage|sessionStorage|document\.cookie|console\.|adsbygoogle|gtag\/js/);
});

test('bootstrap is idempotent and cannot overwrite a saved choice on client navigation',()=>{
  const f=fixture(),count=f.entries().length,queue=f.window.googlefc.callbackQueue.length;
  vm.runInContext(source,f.context);
  assert.equal(f.entries().length,count);assert.equal(f.window.googlefc.callbackQueue.length,queue);
});

test('missing Consent Mode API and unknown/not-configured/not-applicable statuses never grant consent',()=>{
  for(const status of [undefined,0,2,3,4,99,'1']){
    const f=fixture();f.window.googlefc.getGoogleConsentModeValues=()=>({adStoragePurposeConsentStatus:status,analyticsStoragePurposeConsentStatus:status,adUserDataPurposeConsentStatus:status,adPersonalizationPurposeConsentStatus:status});
    f.callback('CONSENT_MODE_DATA_READY')();
    const update=f.entries().find(row=>row[1]==='update')[2];
    assert.deepEqual(JSON.parse(JSON.stringify(update)),denied);
  }
  const f=fixture();f.callback('CONSENT_MODE_DATA_READY')();
  assert.deepEqual(JSON.parse(JSON.stringify(f.entries().at(-1)[2])),denied);
});

test('Consent Mode callback reads each actual Google purpose separately',()=>{
  const f=fixture();f.window.googlefc.getGoogleConsentModeValues=()=>({adStoragePurposeConsentStatus:1,analyticsStoragePurposeConsentStatus:2,adUserDataPurposeConsentStatus:1,adPersonalizationPurposeConsentStatus:0});
  f.callback('CONSENT_MODE_DATA_READY')();
  assert.deepEqual(JSON.parse(JSON.stringify(f.entries().at(-1)[2])),{ad_storage:'granted',analytics_storage:'denied',ad_user_data:'granted',ad_personalization:'denied'});
});

test('TCF callbacks report readiness without guessing Google grants or logging TC strings',()=>{
  const f=fixture();let listener;
  f.window.googlefc.showRevocationMessage=()=>{};
  f.window.__tcfapi=(command,version,callback)=>{assert.equal(command,'addEventListener');assert.equal(version,2);listener=callback;};
  f.callback('CONSENT_API_READY')();const before=f.entries().length;
  listener({eventStatus:'useractioncomplete',purpose:{consents:{1:true}},tcString:'synthetic-test-string'},true);
  assert.equal(f.document.documentElement.dataset.blueSassCmpTcf,'available');
  assert.equal(f.entries().length,before);
  assert.doesNotMatch(JSON.stringify(f.document),/synthetic-test-string/);
  assert.equal(f.document.documentElement.dataset.blueSassCmpReady,'true');
});

test('privacy reopening fails accurately without the real API and uses the official ready queue when available',async()=>{
  const savedWindow=globalThis.window,savedDocument=globalThis.document;
  try{
    const f=fixture();globalThis.window=f.window;globalThis.document=f.document;
    const client=load('lib/cmp-client.ts');
    assert.equal(await client.openCertifiedConsentManager(),false);
    let opened=0;f.window.googlefc.showRevocationMessage=()=>opened++;
    const count=f.window.googlefc.callbackQueue.length;
    const opening=client.openCertifiedConsentManager();
    assert.equal(opened,0);
    f.window.googlefc.callbackQueue[count].CONSENT_API_READY();
    assert.equal(await opening,true);
    assert.equal(opened,1);
    assert.deepEqual(JSON.parse(JSON.stringify(f.entries().at(-1)[2])),denied);
    for(const locale of ['ar','en','nl'])assert.match(client.cmpUnavailableCopy[locale],/help@bluesass\.nl/);
  }finally{globalThis.window=savedWindow;globalThis.document=savedDocument;}
});

test('CSP narrowly allows messaging while excluding ad serving and analytics origins',()=>{
  const csp=publicContentSecurityPolicy();
  for(const directive of ['script-src','connect-src','frame-src'])assert.match(csp,new RegExp(directive+"[^;]*https://fundingchoicesmessages\\.google\\.com"));
  assert.doesNotMatch(csp,/\*|pagead2|doubleclick|googlesyndication|googletagmanager|google-analytics|unsafe-eval/);
  for(const value of ["frame-ancestors 'none'","object-src 'none'",'upgrade-insecure-requests'])assert.ok(csp.includes(value));
  assert.doesNotMatch(publicContentSecurityPolicy(false),/fundingchoices/);
});

test('a timed-out privacy request cannot later clear or replace a user choice',async()=>{
  const savedWindow=globalThis.window,savedDocument=globalThis.document;
  try{
    const f=fixture();globalThis.window=f.window;globalThis.document=f.document;
    let opened=0;f.window.googlefc.showRevocationMessage=()=>opened++;
    const count=f.window.googlefc.callbackQueue.length;
    const opening=load('lib/cmp-client.ts').openCertifiedConsentManager();
    assert.equal(await opening,false);
    f.window.googlefc.callbackQueue[count].CONSENT_API_READY();
    assert.equal(opened,0);
    assert.equal(f.entries().filter(row=>row[1]==='update').length,0);
  }finally{globalThis.window=savedWindow;globalThis.document=savedDocument;}
});

test('localized layout preserves RTL and loads bootstrap before only the CMP, with QA isolation',()=>{
  const layout=fs.readFileSync('app/[locale]/layout.tsx','utf8');
  assert.match(layout,/dir=\{getDir\(locale\)\}/);
  assert.match(layout,/CMP_ENABLED && process\.env\.QA_PUBLIC_ONLY !== '1'/);
  assert.ok(layout.indexOf('id="blue-sass-cmp-bootstrap"')<layout.indexOf('id="blue-sass-google-cmp"'));
  assert.match(layout,/strategy="beforeInteractive"/);
  assert.doesNotMatch(layout,/<AdSense|adsbygoogle|googletagmanager/);
  const footer=fs.readFileSync('components/site-footer.tsx','utf8');
  assert.match(footer,/role="status"/);assert.match(footer,/cmpUnavailableCopy/);
  const ads=fs.readFileSync('components/adsense.tsx','utf8');
  assert.doesNotMatch(ads,/adsbygoogle|<script|\.push\(/);
});
