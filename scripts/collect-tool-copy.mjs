import fs from "node:fs";
import { load } from "./test-typescript-loader.mjs";
const { toolEnglish } = load("lib/i18n/platform-tools.ts");
const phrases = new Set();
function visit(value) { if (typeof value === "string") phrases.add(value); else if (value && typeof value === "object") Object.values(value).forEach(visit); }
visit(toolEnglish);
fs.mkdirSync("downloads/i18n", { recursive: true });
fs.writeFileSync("downloads/i18n/tool-source.json", JSON.stringify([...phrases].sort(), null, 2));
console.log(`Collected ${phrases.size} public interface phrases; no customer data.`);
