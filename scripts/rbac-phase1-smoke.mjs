/**
 * Local smoke test for RBAC Phase 1 role normalize rules (no DB / no TS loader).
 * Run: node scripts/rbac-phase1-smoke.mjs
 */
import assert from "assert";
import fs from "fs";
import path from "path";

function normalizeAdminRole(role) {
  const raw = typeof role === "string" ? role.trim().toLowerCase() : "";
  if (raw === "subadmin") return "subadmin";
  return "superadmin";
}

assert.strictEqual(normalizeAdminRole("admin"), "superadmin");
assert.strictEqual(normalizeAdminRole("superadmin"), "superadmin");
assert.strictEqual(normalizeAdminRole("subadmin"), "subadmin");
assert.strictEqual(normalizeAdminRole(""), "superadmin");
assert.strictEqual(normalizeAdminRole(null), "superadmin");

const permFile = fs.readFileSync(
  path.join(process.cwd(), "src/server/rbac/permissions.ts"),
  "utf8",
);
const permMatches = permFile.match(/"[a-zA-Z]+\.[a-zA-Z]+"/g) || [];
// ADMIN_PERMISSIONS entries only (rough): count unique dotted strings in the const block
const unique = new Set(permMatches);
assert.ok(unique.size >= 30, `expected >=30 permissions, got ${unique.size}`);

console.log(
  JSON.stringify(
    {
      ok: true,
      legacyAdminMapsToSuperadmin: true,
      permissionTokensFound: unique.size,
    },
    null,
    2,
  ),
);
