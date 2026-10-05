import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
export function load(path) {
  const file = resolve(path);
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith(".json")) {
    const value = JSON.parse(readFileSync(file, "utf8"));
    cache.set(file, value);
    return value;
  }
  const compiled = { exports: {} };
  cache.set(file, compiled.exports);
  const source = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const extension = spec => /\.(ts|json)$/.test(spec) ? spec : `${spec}.ts`;
  const require = spec => spec === "server-only" ? {} : spec.startsWith("@/") ? load(extension(spec.slice(2))) : spec.startsWith(".") ? load(resolve(dirname(file), extension(spec))) : nativeRequire(spec);
  new Function("require", "module", "exports", source)(require, compiled, compiled.exports);
  cache.set(file, compiled.exports);
  return compiled.exports;
}
