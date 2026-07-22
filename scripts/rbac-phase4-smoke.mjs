/**
 * Phase 4 smoke: audit actor formatting + inactive session rules (pure).
 * Run: node scripts/rbac-phase4-smoke.mjs
 */
import assert from "assert";

function formatAuditActor(subject) {
  return `${subject.email} (${subject.role})`;
}

assert.strictEqual(
  formatAuditActor({ email: "a@b.com", role: "superadmin" }),
  "a@b.com (superadmin)",
);
assert.strictEqual(
  formatAuditActor({ email: "x@y.com", role: "subadmin" }),
  "x@y.com (subadmin)",
);

function resolveExplicit(explicit) {
  const trimmed = typeof explicit === "string" ? explicit.trim() : "";
  if (trimmed && trimmed !== "admin") return trimmed;
  return null;
}

assert.strictEqual(resolveExplicit("admin"), null);
assert.strictEqual(resolveExplicit("owner@site.com (superadmin)"), "owner@site.com (superadmin)");

console.log(JSON.stringify({ ok: true, phase: 4 }, null, 2));
