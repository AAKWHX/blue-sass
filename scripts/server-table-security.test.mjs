import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { protectServerTables, privateServerTables } from "./server-table-security.mjs";
import ts from "typescript";
import { getTableConfig } from "drizzle-orm/pg-core";
import { load } from "./test-typescript-loader.mjs";
test("every declarative application table retains RLS during ORM schema changes",()=>{
  const file="lib/db/schema.ts";const source=readFileSync(file,"utf8");const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);const schema=load(file);let tables=0;
  function visit(node){if(ts.isVariableDeclaration(node)&&node.initializer){const init=node.initializer;const protectedCall=ts.isCallExpression(init)&&ts.isPropertyAccessExpression(init.expression)&&init.expression.name.text==="enableRLS";const definition=protectedCall?init.expression.expression:init;if(ts.isCallExpression(definition)&&definition.expression.getText(ast)==="pgTable"){tables+=1;const name=node.name.getText(ast);assert.equal(getTableConfig(schema[name]).enableRLS,true,`${name} must enable RLS`);}}ts.forEachChild(node,visit);}
  visit(ast);assert.ok(tables>=24);
});
test("private payments revoke all client grants while public reviews retain only existing read access", async()=>{
  const calls=[];
  const transaction=(strings,...values)=>{
    if(typeof strings==="string")return {identifier:strings};
    const query=strings.join("?");calls.push({query,values});
    return Promise.resolve(query.startsWith("SELECT")?[{rolname:"anon"},{rolname:"authenticated"}]:[]);
  };
  await protectServerTables(transaction,["staff_access","payments","reviews"]);
  assert.equal(calls.filter(call=>call.query.startsWith("ALTER TABLE")).length,3);
  const revokes=calls.filter(call=>call.query.startsWith("REVOKE"));assert.equal(revokes.length,9);
  for(const call of revokes){
    assert.ok(call.query.endsWith("FROM PUBLIC") || ["anon","authenticated"].includes(call.values[1].identifier));
    if(call.values[0].identifier==="reviews"){
      assert.match(call.query,/REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER/);
      assert.ok(!call.query.includes("SELECT"));
    }else assert.match(call.query,/REVOKE ALL PRIVILEGES/);
  }
  assert.equal(revokes.filter(call=>call.query.endsWith("FROM PUBLIC")).length,3);
  assert.ok(!calls.some(call=>/^(GRANT|CREATE POLICY|DROP POLICY)/.test(call.query)));
  await assert.rejects(protectServerTables(transaction,["users; DROP TABLE users"]));
});
test("deployment migration entry points remain unconditional non-executable locks",()=>{
  const files=readdirSync("scripts").filter(name=>/^apply-.*-migration\.mjs$/.test(name));
  assert.equal(files.length,5);
  for(const file of files){
    const source=readFileSync('scripts/'+file,'utf8').replace(/^\/\/[^\n]*\n/, '').trim();
    assert.equal(source,'throw new Error("QA_ENTRY_POINT_NOT_APPROVED_L2_B1");',file);
  }
  assert.ok(privateServerTables.includes("payments"));
});

test("PUBLIC is protected even without optional Supabase roles; invalid input has no side effects", async () => {
  const calls = [];
  const tx = (strings, ...values) => {
    if (typeof strings === "string") return { identifier: strings };
    calls.push({ query: strings.join("?"), values });
    return Promise.resolve([]);
  };
  for (const tables of [[], ["reviews", "unexpected"], ["payments; DROP TABLE users"]]) {
    await assert.rejects(protectServerTables(tx, tables));
  }
  assert.equal(calls.length, 0);
  await protectServerTables(tx, ["payments", "reviews"]);
  const first = calls.map(call => call.query);
  calls.length = 0;
  await protectServerTables(tx, ["payments", "reviews"]);
  assert.deepEqual(calls.map(call => call.query), first);
  assert.equal(calls.filter(call => call.query.endsWith("FROM PUBLIC")).length, 2);
  assert.ok(calls.every(call => !/^(GRANT|CREATE POLICY|DROP POLICY)/.test(call.query)));
});
