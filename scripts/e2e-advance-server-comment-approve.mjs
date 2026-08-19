/**
 * E2E cross-check: Advance Server comment Approve must not log out admin.
 * Usage: node scripts/e2e-advance-server-comment-approve.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const checks = [];

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function lineCount(rel) {
  return read(rel).split(/\r?\n/).length;
}

function main() {
  const route = read("app/api/admin/comments/route.ts");
  const newsRepo = read("src/server/repositories/commentsRepository.ts");
  const pageRepo = read("src/server/repositories/pageCommentsRepository.ts");
  const dbSafe = read("src/server/dbSafe.ts");
  const meRoute = read("app/api/admin/me/route.ts");
  const subject = read("src/server/rbac/requirePermission.ts");
  const client = read("app/admin/comments/AdminCommentsClient.tsx");
  const publicForm = read("src/components/PageCommentSection.tsx");
  const landing = read("src/components/FfAdvanceServerLandingPage.tsx");

  route.includes('if (source === "page") return moderatePageComment')
    ? pass("PATCH page source updates page_comments only")
    : fail("PATCH page source updates page_comments only");

  route.includes('if (source === "news") return moderateComment')
    ? pass("PATCH news source updates news comments only")
    : fail("PATCH news source updates news comments only");

  route.includes("source: commentSourceSchema()")
    ? pass("PATCH accepts optional source in body")
    : fail("PATCH accepts optional source in body");

  route.includes("removeBySource") &&
  route.includes('searchParams.get("source")')
    ? pass("DELETE uses source query so page delete skips news table")
    : fail("DELETE uses source query so page delete skips news table");

  newsRepo.includes("newsComment.findUnique") &&
  newsRepo.indexOf("findUnique") < newsRepo.indexOf("newsComment.update")
    ? pass("news moderate finds row before update (no P2025 on miss)")
    : fail("news moderate finds row before update (no P2025 on miss)");

  pageRepo.includes("findUnique") &&
  pageRepo.includes("pc.update") &&
  pageRepo.indexOf("findUnique") < pageRepo.lastIndexOf("pc.update")
    ? pass("page moderate finds row before update")
    : fail("page moderate finds row before update");

  newsRepo.includes("findUnique") && newsRepo.includes("newsComment.delete")
    ? pass("news delete finds row before delete")
    : fail("news delete finds row before delete");

  pageRepo.includes("findUnique") && pageRepo.includes("pc.delete")
    ? pass("page delete finds row before delete")
    : fail("page delete finds row before delete");

  dbSafe.includes("isPrismaBusinessError") &&
  dbSafe.includes("PrismaClientKnownRequestError") &&
  dbSafe.includes("if (isPrismaBusinessError(error)) return null")
    ? pass("P2025/business Prisma errors do not start 60s DB cooldown")
    : fail("P2025/business Prisma errors do not start 60s DB cooldown");

  const tryPrismaCatch = dbSafe.slice(
    dbSafe.indexOf("export async function tryPrisma"),
    dbSafe.indexOf("export async function tryPrismaLong"),
  );
  /catch\s*\{/.test(tryPrismaCatch)
    ? fail("tryPrisma still has catch-all that marks DB down")
    : pass("tryPrisma no longer catch-all marks DB down");

  const liveBlock = meRoute.slice(meRoute.indexOf("const live ="));
  liveBlock.includes("isPrismaUnavailable") &&
  liveBlock.includes("fromCookie") &&
  liveBlock.indexOf("isPrismaUnavailable") < liveBlock.indexOf("clearSession")
    ? pass("/me keeps session cookie when Prisma is on cooldown")
    : fail("/me keeps session cookie when Prisma is on cooldown");

  subject.includes("isPrismaUnavailable") &&
  subject.includes("subjectFromSessionPayload")
    ? pass("admin page guard uses cookie RBAC instead of login redirect on cooldown")
    : fail("admin page guard uses cookie RBAC instead of login redirect on cooldown");

  client.includes('updateStatus(item.id, "approved", item.source)') &&
  client.includes('updateStatus(item.id, "rejected", item.source)') &&
  client.includes('updateStatus(item.id, "spam", item.source)')
    ? pass("Approve / Reject / Spam all send source")
    : fail("Approve / Reject / Spam all send source");

  client.includes("source: item.source") &&
  client.includes("confirmDelete.source")
    ? pass("Delete confirm passes source")
    : fail("Delete confirm passes source");

  client.includes('JSON.stringify({ id, status, source })') &&
  client.includes('credentials: "include"')
    ? pass("PATCH body includes source + cookies")
    : fail("PATCH body includes source + cookies");

  publicForm.includes('pageKey') &&
  publicForm.includes("/api/page-comments") &&
  landing.includes("PageCommentSection") &&
  landing.includes("listApprovedPageComments")
    ? pass("public Advance Server still posts pending; page lists approved only")
    : fail("public Advance Server still posts pending; page lists approved only");

  const files = [
    "src/server/dbSafe.ts",
    "src/server/repositories/commentsRepository.ts",
    "src/server/repositories/pageCommentsRepository.ts",
    "app/api/admin/comments/route.ts",
    "app/admin/comments/AdminCommentsClient.tsx",
    "src/server/rbac/requirePermission.ts",
    "app/api/admin/me/route.ts",
  ];
  const over = files.filter((f) => lineCount(f) > 400);
  over.length === 0
    ? pass("all touched files stay under 400 lines", files.map((f) => `${path.basename(f)}:${lineCount(f)}`).join(", "))
    : fail("all touched files stay under 400 lines", over.join(", "));

  const failed = checks.filter((c) => !c.ok);
  console.log("\n--- Summary ---");
  console.log(
    `Total: ${checks.length}  Pass: ${checks.length - failed.length}  Fail: ${failed.length}`,
  );
  if (failed.length) {
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail ?? ""}`);
    process.exitCode = 1;
  }
}

main();
