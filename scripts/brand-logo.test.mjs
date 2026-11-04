import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "./test-typescript-loader.mjs";

test("multiple brand logos render without duplicate document IDs and retain their name", () => {
  const { BrandLogo } = load("components/brand-logo.tsx");
  const html = renderToStaticMarkup(createElement("div", null, createElement(BrandLogo), createElement(BrandLogo)));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal((html.match(/aria-label="Blue Sass"/g) || []).length, 2);
  assert.equal((html.match(/src="\/blue-sass-mark.svg"/g) || []).length, 2);
});
