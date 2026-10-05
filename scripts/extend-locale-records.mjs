// Mechanical migration of existing seven-language catalogs to static extra locales.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.tsx?$/.test(file) && !/i18n[\\/](config|extra-locales)\.ts$/.test(file)) files.push(file);
  }
}
for (const directory of ['app', 'components', 'lib']) walk(directory);
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const replacements = [];
  function visit(node) {
    if (ts.isAsExpression(node) && node.type.getText(source) === 'const' && ts.isCallExpression(node.expression) && node.expression.expression.getText(source) === 'withExtraLocales') {
      replacements.push({ start: node.getStart(source), end: node.end, text: `withExtraLocales(${node.expression.arguments[0].getText(source)} as const)` });
      return;
    }
    if (ts.isObjectLiteralExpression(node)) {
      const names = node.properties.filter(ts.isPropertyAssignment).map(property => property.name.getText(source).replace(/["']/g, ''));
      const wrapped = ts.isCallExpression(node.parent) && node.parent.expression.getText(source) === 'withExtraLocales';
      if (names.includes('en') && names.includes('ar') && !wrapped) {
        replacements.push({ start: node.getStart(source), end: node.end, text: `withExtraLocales(${node.getText(source)})` });
        return;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!replacements.length) continue;
  for (const edit of replacements.sort((a, b) => b.start - a.start)) content = content.slice(0, edit.start) + edit.text + content.slice(edit.end);
  if (!content.includes('import { withExtraLocales }')) {
    const importLine = 'import { withExtraLocales } from "@/lib/i18n/extra-locales";\n';
    const directive = /^("use (?:client|server)";\r?\n)/.exec(content);
    content = directive ? content.replace(directive[0], directive[0] + importLine) : importLine + content;
  }
  fs.writeFileSync(file, content);
  console.log(`${file}: ${replacements.length} catalogs extended`);
}
