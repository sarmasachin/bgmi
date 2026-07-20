/** Human-readable audit log labels for the admin UI. */

type Payload = Record<string, unknown>;

function asPayload(raw: unknown): Payload {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Payload)
    : {};
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function shortId(id: string): string {
  const t = id.trim();
  if (!t) return "—";
  if (t.length <= 14) return t;
  return `${t.slice(0, 6)}…${t.slice(-4)}`;
}

function statusWord(status: string): string {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "pending") return "pending";
  if (status === "published") return "published";
  if (status === "draft") return "draft";
  return status || "updated";
}

const ACTION_LABELS: Record<string, string> = {
  "testimonial.moderate": "Updated a testimonial",
  "testimonial.delete": "Deleted a testimonial",
  "comment.moderate": "Updated a comment",
  "comment.delete": "Deleted a comment",
  "contact.status": "Updated a contact message",
  "contact.delete": "Deleted a contact message",
  "news.create": "Created a news post",
  "news.update": "Updated a news post",
  "news.status.update": "Changed news status",
  "news.delete": "Deleted a news post",
  "page.create": "Created a page",
  "page.update": "Updated a page",
  "page.delete": "Deleted a page",
  "legal.create": "Created a legal page",
  "legal.update": "Updated a legal page",
  "legal.delete": "Deleted a legal page",
  "game-article.update": "Updated a game article",
  "faq.home.update": "Updated home FAQ",
  "faq.game.update": "Updated a game FAQ",
  "users.create": "Created an admin user",
  "users.activate": "Activated a user",
  "users.deactivate": "Deactivated a user",
  "users.resetPassword": "Reset a user password",
  "settings.update": "Updated site settings",
  "settings.head-snippets.update": "Updated head snippets",
  "ads.update": "Updated an ad unit",
  "ads.placements": "Updated ad placements",
  "media.upload": "Uploaded media",
  "media.delete": "Deleted media",
  "media.convert": "Converted media",
  "media.defaults": "Updated media defaults",
  "backup.restore": "Restored a backup",
  "calculator.phone-models.update": "Updated phone models",
};

export function formatAuditWhatHappened(action: string, payload?: unknown): string {
  const p = asPayload(payload);

  if (action === "testimonial.moderate") {
    const status = str(p.status);
    if (status === "approved") return "Approved a testimonial";
    if (status === "rejected") return "Rejected a testimonial";
    if (status === "pending") return "Marked a testimonial as pending";
  }

  if (action === "comment.moderate") {
    const status = str(p.status);
    if (status) return `${statusWord(status).replace(/^./, (c) => c.toUpperCase())} a comment`;
  }

  if (action === "news.status.update") {
    const status = str(p.status);
    if (status) return `Set news status to ${statusWord(status)}`;
  }

  if (action === "users.activate") return "Activated a user account";
  if (action === "users.deactivate") return "Deactivated a user account";

  return ACTION_LABELS[action] ?? action.replace(/\./g, " → ");
}

export function formatAuditDetails(
  action: string,
  target: string,
  payload?: unknown,
): string {
  const p = asPayload(payload);
  const parts: string[] = [];

  const name = str(p.name) || str(p.author) || str(p.title);
  const email = str(p.email);
  const slug = str(p.slug);
  const filename = str(p.filename) || (target.includes(".") && !target.startsWith("cm") ? target : "");
  const game = str(p.game);
  const status = str(p.status);

  if (name) parts.push(name);
  if (email && email !== name) parts.push(email);
  if (slug) parts.push(`/${slug}`);
  if (filename && !parts.includes(filename)) parts.push(filename);
  if (game) parts.push(game.toUpperCase());
  if (status && action !== "testimonial.moderate" && action !== "comment.moderate" && action !== "news.status.update") {
    parts.push(statusWord(status));
  }

  if (action === "testimonial.moderate" && p.trimmed) {
    parts.push("oldest approved removed to free a slot");
  }

  if (action === "settings.update") {
    const keys = Array.isArray(p.keys) ? p.keys.filter((k) => typeof k === "string") : [];
    if (keys.length) parts.push(`sections: ${keys.join(", ")}`);
  }

  if (action === "faq.home.update" || action === "calculator.phone-models.update") {
    const count = typeof p.count === "number" ? p.count : typeof p.savedCount === "number" ? p.savedCount : null;
    if (count !== null) parts.push(`${count} items saved`);
  }

  // Prefer friendly bits; fall back to a short ID when target is a cuid-like id.
  if (parts.length === 0) {
    if (!target || target === "system" || target === "site-settings" || target === "visibility") {
      return target || "—";
    }
    if (target.includes("@")) return target;
    if (target.length > 16 && /^[a-z0-9]+$/i.test(target)) {
      return `Item ${shortId(target)}`;
    }
    return target;
  }

  // If we only have technical target id and some payload, append short id for reference.
  if (target && target.length > 16 && /^[c][a-z0-9]+$/i.test(target) && !email && !slug && !filename) {
    parts.push(`ref ${shortId(target)}`);
  }

  return parts.join(" · ");
}

export function formatAuditActor(actor: string): string {
  const a = actor.trim();
  if (!a) return "System";
  if (a === "admin") return "Admin";
  return a;
}
