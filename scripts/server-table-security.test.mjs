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
test("private server tables are protected without changing trusted server roles or existing review grants", async()=>{
  const calls=[];
  const transaction=(strings,...values)=>{
    if(typeof strings==="string")return {identifier:strings};
    const query=strings.join("?");calls.push({query,values});
    return Promise.resolve(query.startsWith("SELECT")?[{rolname:"anon"},{rolname:"authenticated"}]:[]);
  };
  await protectServerTables(transaction,["staff_access","reviews"]);
  assert.equal(calls.filter(call=>call.query.startsWith("ALTER TABLE")).length,2);
  const revokes=calls.filter(call=>call.query.startsWith("REVOKE"));assert.equal(revokes.length,2);
  for(const call of revokes){assert.equal(call.values[0].identifier,"staff_access");assert.ok(["anon","authenticated"].includes(call.values[1].identifier));}
  await assert.rejects(protectServerTables(transaction,["users; DROP TABLE users"]));
});
test("every table created by deployment migrations has in-transaction RLS protection",()=>{
  const files=readdirSync("scripts").filter(name=>/^apply-.*-migration\.mjs$/.test(name)).map(name=>`scripts/${name}`);
  const created=new Set();
  for(const file of files){const source=readFileSync(file,"utf8");const protectedNames=[...source.matchAll(/protectServerTables\([^,]+,\s*\[([^\]]+)\]/g)].flatMap(match=>[...match[1].matchAll(/"([a-z_]+)"/g)].map(item=>item[1]));
    for(const match of source.matchAll(/CREATE TABLE IF NOT EXISTS\s+(?:"public"|public)\.(?:"([a-z_]+)"|([a-z_]+))/g)){const name=match[1]??match[2];created.add(name);assert.ok(protectedNames.includes(name),`${file}: ${name} lacks RLS protection`);}
    assert.ok(source.includes(".begin("),`${file}: missing transaction`);
  }
  for(const table of privateServerTables)assert.ok(created.has(table),`Missing migration coverage for ${table}`);
});
