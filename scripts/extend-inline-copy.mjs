// Mechanical localization of existing English fallback UI, without changing Arabic.
import fs from "node:fs";
import ts from "typescript";
const files = ["app/[locale]/create-project/page.tsx", "app/[locale]/portal/orders/[id]/page.tsx", "components/public/subscription-request.tsx", "components/public/company-section.tsx", "components/portal/print-receipt.tsx", "components/portal/client-dashboard.tsx", "app/actions/reviews.ts", "app/actions/profile.ts", "app/[locale]/contact/page.tsx"];
for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const edits = [];
  const visit = node => {
    if (ts.isConditionalExpression(node) && (ts.isStringLiteral(node.whenFalse) || ts.isArrayLiteralExpression(node.whenFalse)) && /\bar\b|locale/.test(node.condition.getText(source)) && !["en", "ar", "ltr", "rtl"].includes(node.whenFalse.text) && !node.parent.getText(source).startsWith("localizeForLocale(")) {
      edits.push({ start: node.whenFalse.getStart(source), end: node.whenFalse.end, text: `localizeForLocale(${node.whenFalse.getText(source)}, locale)` });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (!edits.length) continue;
  for (const edit of edits.sort((a, b) => b.start - a.start)) content = content.slice(0, edit.start) + edit.text + content.slice(edit.end);
  const line = 'import { localizeForLocale } from "@/lib/i18n/extra-locales";\n';
  content = /^("use (?:server|client)";\r?\n)/.test(content) ? content.replace(/^("use (?:server|client)";\r?\n)/, "$1" + line) : line + content;
  fs.writeFileSync(file, content);
}
