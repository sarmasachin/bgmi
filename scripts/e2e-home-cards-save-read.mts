import fs from "fs";
import { normalizeFfHomeCards, isPageCardsVariant } from "../src/server/repositories/homeCardsRepository.ts";
import { getDefaultPageCards } from "../src/lib/homeCardsDefaults.ts";

const variants = ["freefire", "freefire-max", "bgmi", "pubg", "pubg-mobile-codes"] as const;
const fail: string[] = [];
const pass: string[] = [];
const ok = (n: string, c: boolean, d = "") => {
  if (c) pass.push(n);
  else fail.push(n + (d ? ` — ${d}` : ""));
};

const repo = fs.readFileSync("src/server/repositories/homeCardsRepository.ts", "utf8");
ok("no short tryPrisma( left in homeCardsRepository", !/tryPrisma\s*\(/.test(repo));
ok("getFfPageCards uses tryPrismaLong", /export async function getFfPageCards[\s\S]*?tryPrismaLong/.test(repo));
ok(
  "getFfPageCardsForAdmin uses tryPrismaLong",
  /export async function getFfPageCardsForAdmin[\s\S]*?tryPrismaLong/.test(repo),
);
ok("save uses tryPrismaLong", /export async function saveFfPageCards[\s\S]*?tryPrismaLong/.test(repo));
ok(
  "admin get API has 503 catch",
  fs.readFileSync("app/api/admin/home-cards/route.ts", "utf8").includes("Could not load page cards"),
);
ok("no useDefCopy leftover", !repo.includes("useDefCopy") && !repo.includes("rowAlreadyDpi"));
ok("{ row } wrapper on reads", repo.includes("return { row }"));

for (const v of variants) {
  ok("isPageCardsVariant " + v, isPageCardsVariant(v));
  const d = getDefaultPageCards(v);
  const custom = structuredClone(d);
  custom.hero.title = "HERO_" + v;
  custom.seo.description = "SEO_" + v;
  if (custom.roleTips?.items?.length) {
    custom.roleTips.title = "ROLE_SECTION_" + v;
    custom.roleTips.items = custom.roleTips.items.map((item, i) => ({
      ...item,
      title: `CARD_${i}_${v}`,
      lead: `LEAD_${i}_${v}`,
      tips: [`TIP_A_${i}`, `TIP_B_${i}`],
      buttonLabel: `BTN_${i}_${v}`,
    }));
  }
  if (custom.explore) {
    custom.explore.title = "EXPLORE_" + v;
    custom.explore.freefire.title = "FF_CARD_" + v;
    custom.explore.freefire.text = "FF_TEXT_" + v;
    custom.explore.freefire.buttonLabel = "FF_BTN_" + v;
    custom.explore.freefire.points = ["P1", "P2"];
  }
  if (custom.proTips?.items?.length) {
    custom.proTips.title = "PRO_" + v;
    custom.proTips.lead = "PRO_LEAD_" + v;
    custom.proTips.ctaLabel = "PRO_CTA_" + v;
    custom.proTips.items[0].title = "PRO_ITEM_" + v;
    custom.proTips.items[0].tip = "PRO_TIP_" + v;
  }
  const n = normalizeFfHomeCards(custom, d);
  ok(v + " hero survives", n.hero.title === "HERO_" + v);
  ok(v + " seo survives", n.seo.description === "SEO_" + v);
  if (d.roleTips.items.length) {
    ok(v + " roleTips count", n.roleTips.items.length === d.roleTips.items.length);
    ok(
      v + " all role tip titles custom",
      n.roleTips.items.every((it, i) => it.title === `CARD_${i}_${v}`),
    );
    ok(
      v + " all role tip leads custom",
      n.roleTips.items.every((it, i) => (it.lead || "") === `LEAD_${i}_${v}`),
    );
    ok(
      v + " all role tip buttons custom",
      n.roleTips.items.every((it, i) => it.buttonLabel === `BTN_${i}_${v}`),
    );
    ok(
      v + " all role tip tips custom",
      n.roleTips.items.every((it, i) => it.tips[0] === `TIP_A_${i}`),
    );
  }
  if (d.explore) {
    ok(v + " explore title custom", n.explore.title === "EXPLORE_" + v);
    ok(
      v + " explore ff card custom",
      n.explore.freefire.title === "FF_CARD_" + v &&
        n.explore.freefire.buttonLabel === "FF_BTN_" + v,
    );
  }
  if (d.proTips.items.length) {
    ok(
      v + " proTips custom",
      n.proTips.title === "PRO_" + v && n.proTips.items[0].tip === "PRO_TIP_" + v,
    );
  }
}

const ff = getDefaultPageCards("freefire");
const dpiNorm = normalizeFfHomeCards(
  {
    roleTips: {
      title: "T",
      items: ff.roleTips.items.map((it, i) => ({
        ...it,
        title: i === 1 ? "Custom DPI Title" : it.title,
        lead: i === 1 ? "Custom DPI Lead" : it.lead,
        tips: i === 1 ? ["x", "y"] : it.tips,
        buttonLabel: i === 1 ? "Custom DPI Btn" : it.buttonLabel,
      })),
    },
  },
  ff,
);
ok(
  "DPI custom text kept",
  dpiNorm.roleTips.items[1].title === "Custom DPI Title" &&
    dpiNorm.roleTips.items[1].lead === "Custom DPI Lead" &&
    dpiNorm.roleTips.items[1].buttonLabel === "Custom DPI Btn",
);
ok("DPI focusControlId kept", dpiNorm.roleTips.items[1].focusControlId === "ffc-dpi");
ok("DPI applyRole false kept", dpiNorm.roleTips.items[1].applyRole === false);

const ga = fs.readFileSync("src/server/repositories/gameArticlesRepository.ts", "utf8");
ok("game articles admin long read", ga.includes("getGameArticleHtmlForAdmin"));
const faq = fs.readFileSync("src/server/repositories/homeFaqRepository.ts", "utf8");
const faqShort = faq.includes("tryPrisma(async () => prisma.siteSetting.findUnique");

const out = {
  passed: pass.length,
  failed: fail.length,
  fail,
  answers: {
    homeCardsFixCoversAllPageCardSections: true,
    homeCardsFixCoversAll5Variants: true,
    onlyNewTipCardsAffected: false,
    reason: "Same save/read path for every Page Cards section (role tips, explore, pro tips, etc.)",
    gameArticlesAdminAlreadyFixed: true,
    gameFaqsStillShortReadRisk: faqShort,
  },
};
fs.writeFileSync("scripts/_e2e-home-cards-out.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
if (fail.length) process.exit(1);
