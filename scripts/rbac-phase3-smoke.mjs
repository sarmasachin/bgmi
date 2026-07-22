/**
 * Smoke checks for Phase 3 API permission resolver (duplicated pure rules).
 * Run: node scripts/rbac-phase3-smoke.mjs
 */
import assert from "assert";

function resolve(pathname, method) {
  const path = pathname.replace(/\/$/, "") || pathname;
  const m = method.toUpperCase();
  const isRead = m === "GET" || m === "HEAD";
  const isDelete = m === "DELETE";

  if (path === "/api/admin/me" || path === "/api/admin/system/health") return { type: "auth-only" };
  if (path === "/api/admin/users") return { type: "permission", permission: "users.manage" };
  if (path === "/api/admin/backup/download") return { type: "permission", permission: "backups.download" };
  if (path === "/api/admin/backup/restore") return { type: "permission", permission: "backups.restore" };
  if (path.startsWith("/api/admin/news")) {
    if (isRead) return { type: "permission", permission: "news.view" };
    if (isDelete) return { type: "permission", permission: "news.delete" };
    return { type: "permission", permission: "news.edit" };
  }
  if (path.startsWith("/api/admin/contact")) {
    if (isRead) return { type: "permission", permission: "contact.view" };
    if (isDelete) return { type: "permission", permission: "contact.delete" };
    return { type: "permission", permission: "contact.reply" };
  }
  return { type: "deny" };
}

assert.deepStrictEqual(resolve("/api/admin/me", "GET").type, "auth-only");
assert.strictEqual(resolve("/api/admin/news", "GET").permission, "news.view");
assert.strictEqual(resolve("/api/admin/news", "POST").permission, "news.edit");
assert.strictEqual(resolve("/api/admin/news", "DELETE").permission, "news.delete");
assert.strictEqual(resolve("/api/admin/users", "GET").permission, "users.manage");
assert.strictEqual(resolve("/api/admin/backup/restore", "POST").permission, "backups.restore");
assert.strictEqual(resolve("/api/admin/unknown-thing", "GET").type, "deny");

console.log(JSON.stringify({ ok: true, phase: 3, checks: 7 }, null, 2));
