import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const element = React.createElement;
const component = ({ children }) => element("div", null, children);
const defaultModule = value => ({ __esModule: true, default: value });

function renderPage(status) {
  const source = readFileSync(new URL("../src/app/dashboard/(admin)/approved-campaigns/[campaign-id]/page.tsx", import.meta.url), "utf8");
  const exports = {};
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const campaign = { campaign_id: 1, name: "Garden".repeat(50), status, date_created: "2026-11-01", competition_id: 1 };
  vm.runInNewContext(outputText, { exports, console, require(name) {
    if (name === "next/navigation") return {
      useParams: () => ({ "campaign-id": "1" }), useRouter: () => ({ push() {} }),
      notFound: () => { throw new Error("Unexpected not-found"); },
    };
    if (name.includes("/hooks/")) {
      if (name.endsWith("useReadCampaign")) return defaultModule(() => ({ data: [campaign] }));
      if (name.endsWith("useReadCompetitionById")) return defaultModule(() => ({ data: { start_date: "2026-11-15", end_date: "2026-12-15" } }));
      if (name.endsWith("useReadCampaignTransactions")) return defaultModule(() => ({ data: [] }));
      if (name.endsWith("useGivebutterCampaignSuspension")) return defaultModule(() => ({ suspend: {}, unsuspend: {} }));
      return defaultModule(() => ({}));
    }
    if (name.endsWith("buildEarningsTrend")) return { transactionsToDailyEarnings: () => [] };
    if (name === "@mui/icons-material") return { ArrowBack: () => null, Close: () => null, OpenInNew: () => null };
    if (name === "@mui/material/Button") return defaultModule(({ children, disabled }) => element("button", { disabled }, children));
    if (name === "@mui/material/Chip") return defaultModule(({ label }) => element("span", null, label));
    if (name.startsWith("@/src/components/")) {
      const basename = name.split("/").at(-1);
      return { ...defaultModule(component), [basename]: component };
    }
    return require(name);
  } });
  return renderToStaticMarkup(element(exports.default));
}

test("the admin campaign header allows long names and controls to wrap", () => {
  const html = renderPage("published");
  assert.match(html, /class="min-w-0 flex-1 flex-col/);
  assert.match(html, /class="mb-5 flex flex-wrap/);
  assert.match(html, /<h3 class="min-w-0 break-words/);
  assert.match(html, /class="flex min-w-0 flex-wrap items-center/);
});

test("the unsuspend dialog promises only a Published status", () => {
  const html = renderPage("suspended");
  assert.match(html, /will return to Published status/);
  assert.doesNotMatch(html, /receive donations again/);
});
