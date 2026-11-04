export const QA_TARGET = Object.freeze({host:"127.0.0.1",port:55443,database:"bluesass_payments_qa",username:"bluesass_qa_runtime"});
const fail = () => { throw new Error("QA_DATABASE_CONFIGURATION_REJECTED"); };
export function localDatabaseOptions(raw, env = {}) {
  if (typeof raw !== "string" || !raw || raw !== raw.trim() || /[\s\\\u0000-\u001f\u007f]/u.test(raw)) fail();
  if (Object.keys(env).some(k => /^PG|^POSTGRES|^SUPABASE|^NEON|^DATABASE_(?!URL$)|^DB_|^INFISICAL|^NODE_OPTIONS$|^NODE_PATH$/i.test(k))) fail();
  let url, password;
  try { url = new URL(raw); password = decodeURIComponent(url.password); } catch { fail(); }
  if (!/^postgres(?:ql)?:\/\/bluesass_qa_runtime:[^@/?#\\]+@127\.0\.0\.1:55443\/bluesass_payments_qa$/u.test(raw)) fail();
  if (!["postgres:","postgresql:"].includes(url.protocol) || url.hostname !== QA_TARGET.host || url.port !== String(QA_TARGET.port) || url.pathname !== "/"+QA_TARGET.database || url.username !== QA_TARGET.username || url.search || url.hash) fail();
  if (!password || /[\u0000-\u001f\u007f]/u.test(password)) fail();
  return Object.freeze({...QA_TARGET,password,ssl:false,prepare:false,max:1,connect_timeout:5,idle_timeout:10,connection:{application_name:"blue_sass_local_qa",search_path:"public",default_transaction_read_only:true}});
}
export function assertQaRuntimeApproved() {
  // This code lock cannot be enabled by inherited environment variables.
  throw new Error("QA_RUNTIME_LOCKED_L2_B1");
}
export function createQaClient(raw, env, factory) {
  const options = localDatabaseOptions(raw,env);
  assertQaRuntimeApproved();
  return factory(options);
}
export function assertIdentityEvidence(evidence, expected) {
  const denied = () => { throw new Error("QA_DATABASE_IDENTITY_REJECTED"); };
  if (!evidence || !expected || typeof expected.marker !== "string" || expected.marker.length < 16 || typeof expected.systemIdentifier !== "string" || !/^\d{10,}$/.test(expected.systemIdentifier)) denied();
  if (evidence.host !== QA_TARGET.host || evidence.port !== QA_TARGET.port || evidence.database !== QA_TARGET.database || evidence.sessionUser !== QA_TARGET.username || evidence.currentUser !== QA_TARGET.username) denied();
  for (const key of ["superuser","bypassRls","createdb","createrole","replication","ownsApplicationObjects"]) if (evidence[key] !== false) denied();
  if (!Array.isArray(evidence.memberships) || evidence.memberships.length || evidence.marker !== expected.marker || evidence.systemIdentifier !== expected.systemIdentifier || evidence.readOnly !== true) denied();
  return true;
}
