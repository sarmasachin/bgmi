/**
 * Every game family menu must include News pointing at that game's listing.
 * Usage: npx tsx scripts/e2e-game-nav-news.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  newsCategoryListingPath,
} from "../src/lib/newsCategories.ts";
import {
  BGMI_FAMILY_NAV,
  BGMI_LITE_NAV,
  PUBG_FAMILY_NAV,
} from "../src/lib/resolveNavForPath.ts";
import { FREE_FIRE_FAMILY_NAV } from "../src/lib/freeFirePages.ts";
import { FREE_FIRE_MAX_FAMILY_NAV } from "../src/lib/freeFireMaxPages.ts";
import { PUBG_MOBILE_LITE_NAV } from "../src/lib/pubgMobileLite.ts";
import { SITE_GAME_NAV } from "../src/lib/siteGameNav.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function newsHref(nav) {
  const row = nav.find((item) => item.label === "News");
  return row?.href ?? null;
}

function main() {
  console.log("=== e2e-game-nav-news ===");
  const expected = [
    ["Free Fire", FREE_FIRE_FAMILY_NAV, newsCategoryListingPath("free-fire")],
    ["Free Fire Max", FREE_FIRE_MAX_FAMILY_NAV, newsCategoryListingPath("ff-max")],
    ["PUBG Mobile", PUBG_FAMILY_NAV, newsCategoryListingPath("pubg")],
    ["PUBG Mobile Lite", PUBG_MOBILE_LITE_NAV, newsCategoryListingPath("pubg-mobile-lite")],
    ["BGMI", BGMI_FAMILY_NAV, newsCategoryListingPath("bgmi")],
    ["BGMI Lite", BGMI_LITE_NAV, newsCategoryListingPath("bgmi-lite")],
  ];
  for (const [name, nav, href] of expected) {
    assert(newsHref(nav) === href, `${name} News should be ${href}, got ${newsHref(nav)}`);
    console.log(`  OK  ${name} → ${href}`);
  }

  const header = Object.fromEntries(SITE_GAME_NAV.map((item) => [item.id, item]));
  assert(newsHref(header.pubg.children) === "/news/pubg", "header PUBG submenu News");
  assert(newsHref(header.bgmi.children) === "/news/bgmi", "header BGMI submenu News");
  assert(newsHref(header["bgmi-lite"].children) === "/news/bgmi-lite", "header BGMI Lite submenu News");
  assert(newsHref(header["pubg-lite"].children) === "/news/pubg-mobile-lite", "header PUBG Lite submenu News");
  assert(newsHref(header["free-fire"].children) === "/news/free-fire", "header FF submenu News");
  assert(newsHref(header["free-fire-max"].children) === "/news/ff-max", "header FF Max submenu News");

  const cats = fs.readFileSync(path.join(root, "src/lib/newsCategories.ts"), "utf8");
  assert(cats.includes('slug: "pubg"'), "DEFAULT_NEWS_CATEGORIES must include pubg");
  const repo = fs.readFileSync(path.join(root, "src/server/repositories/newsCategoryRepository.ts"), "utf8");
  assert(repo.includes('slug: "pubg"'), "ensure hubs must create pubg category");

  console.log("PASS  all game menus have category News links");
}

main();
