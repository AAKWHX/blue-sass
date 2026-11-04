import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function load(file, env={}, imports={}) {
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const compiled={exports:{}};
  new Function('require','module','exports','process',code)(name=>{
    if(Object.hasOwn(imports,name))return imports[name];
    throw Error('Unexpected runtime import: '+name);
  },compiled,compiled.exports,{env});
  return compiled.exports;
}
test('DB module ignores even poisoned environment and never imports a database driver',()=>{
  const env=new Proxy({DATABASE_URL:'postgresql://synthetic:synthetic@production.invalid/db'},{get(){throw Error('Environment must not be read');}});
  const db=load('lib/db/index.ts',env,{'server-only':{},'./schema':{}});
  assert.equal(db.isDatabaseConfigured,false);
  assert.throws(()=>db.db.select(),/RUNTIME_LOCKED/);
});
test('all private capabilities remain off even when every activation variable is true',()=>{
  const env=Object.fromEntries(['ACCOUNTS','PORTAL','ADMIN','PROJECT_WORKFLOWS','INQUIRIES','PAYMENTS'].map(k=>['BLUE_SASS_'+k+'_ENABLED','true']));
  env.STRIPE_PAYMENTS_ENABLED='true';
  const c=load('lib/capabilities.ts',env);
  assert.ok(Object.values(c.publicFeatureFlags).every(v=>v===false));
  for(const locale of ['ar','en','nl'])for(const page of ['login','register','forgot-password','verify','staff','portal','admin','quote','create-project'])assert.equal(c.isTemporarilyDisabledPath(`/${locale}/${page}`),true);
  for(const api of ['inquiries','auth/session','paypal/orders','stripe/checkout'])assert.equal(c.isTemporarilyDisabledPath('/api/'+api),true);
});
test('ordinary QA scripts and provider/database execution locks remain in force',()=>{
  const p=JSON.parse(fs.readFileSync('package.json','utf8'));
  for(const mode of ['dev','prebuild','build','start','db:seed','db:migrate'])assert.equal(p.scripts[mode],'node qa/block-execution.mjs');
  for(const file of ['lib/paypal.ts','lib/stripe.ts','lib/email/resend.ts'])assert.match(fs.readFileSync(file,'utf8'),/assertQaRuntimeApproved/);
  assert.match(fs.readFileSync('lib/db/qa-local-guard.mjs','utf8'),/throw new Error\("QA_RUNTIME_LOCKED_L2_B1"\)/);
});
