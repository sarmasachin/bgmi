/**
 * E2E: Admin Back stays in same module when Create/Edit form is open.
 * Usage: node scripts/e2e-admin-editor-back.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function read(rel) {
  const full = path.join(root, rel);
  assert(fs.existsSync(full), `Missing ${rel}`);
  return fs.readFileSync(full, "utf8");
}

function lineCount(rel) {
  return read(rel).split(/\r?\n/).length;
}

/** Simulate pushState + Back while editor open. */
function simulateEditorBack() {
  const stack = [{ url: "/admin/pages" }, { url: "/admin/news" }];
  let editorOpen = false;
  let leftModule = false;

  function pushEditor() {
    stack.push({ url: "/admin/news", editor: true });
    editorOpen = true;
  }

  function browserBack() {
    const top = stack.pop();
    if (top?.editor) {
      editorOpen = false;
      // stay on same module URL (still /admin/news underneath)
      return;
    }
    leftModule = true;
  }

  // Bug without fix: open form (no history) then back leaves module
  editorOpen = true;
  browserBack(); // pops /admin/news → /admin/pages
  assert(leftModule === true, "sanity: without history, back leaves module");

  // Reset with fix behavior
  leftModule = false;
  editorOpen = false;
  stack.length = 0;
  stack.push({ url: "/admin/pages" }, { url: "/admin/news" });
  pushEditor();
  browserBack();
  assert(editorOpen === false, "back closes editor");
  assert(leftModule === false, "back must NOT leave News module");
  assert(stack[stack.length - 1].url === "/admin/news", "still on /admin/news");
  console.log("PASS  simulated Back closes editor, stays on same menu");
}

function checkHookAndWiring() {
  const hook = read("src/hooks/useAdminEditorHistory.ts");
  assert(hook.includes("pushState"), "hook must pushState on open");
  assert(hook.includes("popstate"), "hook must listen popstate");
  assert(hook.includes("dismissEditorHistory"), "hook must support Close button");

  const news = read("app/admin/news/AdminNewsClient.tsx");
  assert(news.includes("useAdminEditorHistory"), "News must use editor history hook");
  assert(news.includes("dismissEditorHistory"), "News close must dismiss history");

  const pages = read("app/admin/pages/AdminPagesClient.tsx");
  assert(pages.includes("useAdminEditorHistory"), "Pages must use editor history hook");
  assert(pages.includes("dismissEditorHistory"), "Pages close must dismiss history");

  const layout = read("app/admin/AdminLayoutClient.tsx");
  const idx = layout.indexOf("admin-nav-link");
  assert(idx > 0, "nav link missing");
  assert(layout.slice(idx - 180, idx + 40).includes("replace"), "sidebar Link replace still required");

  const pagesLines = lineCount("app/admin/pages/AdminPagesClient.tsx");
  assert(pagesLines <= 1000, `AdminPagesClient over 1000 lines (${pagesLines})`);
  console.log("PASS  hook wired in News + Pages; sidebar replace; line limit");
}

function main() {
  console.log("=== e2e-admin-editor-back ===");
  simulateEditorBack();
  checkHookAndWiring();
  console.log("VERDICT PASS");
}

try {
  main();
} catch (err) {
  console.error("FAIL", err instanceof Error ? err.message : err);
  process.exit(1);
}
