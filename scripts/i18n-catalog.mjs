import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const phrases = new Set();
const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.tsx?$/.test(file) && !file.includes('locales-extra')) files.push(file);
  }
}
for (const directory of ['app', 'components', 'lib']) walk(directory);
function collect(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) phrases.add(node.text);
  if (ts.isTemplateExpression(node)) {
    phrases.add(node.head.text);
    for (const span of node.templateSpans) phrases.add(span.literal.text);
  }
  ts.forEachChild(node, collect);
}
for (const file of files) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'sections' && /[\\/]\[locale\][\\/](privacy|terms)[\\/]/.test(file)) collect(node.initializer);
    if (ts.isObjectLiteralExpression(node)) {
      const english = node.properties.find(property => ts.isPropertyAssignment(property) && property.name.getText(source).replace(/["']/g, '') === 'en');
      const arabic = node.properties.some(property => ts.isPropertyAssignment(property) && property.name.getText(source).replace(/["']/g, '') === 'ar');
      if (english && arabic) collect(english.initializer);
    }
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'translated' && node.arguments[1]) collect(node.arguments[1]);
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'localizeForLocale' && node.arguments[0]) collect(node.arguments[0]);
    ts.forEachChild(node, visit);
  }
  if (file.replaceAll('\\', '/') === 'lib/i18n/dictionaries/en.ts') collect(source);
  visit(source);
}
const text = [...phrases].filter(value => /[a-zA-Z]/.test(value) && !/^(https?:|\/|[\w.+-]+@)/.test(value)).sort();
fs.mkdirSync('downloads/i18n', { recursive: true });
fs.writeFileSync('downloads/i18n/source.json', JSON.stringify(text, null, 2));
console.log(`Collected ${text.length} source phrases from ${files.length} files.`);
