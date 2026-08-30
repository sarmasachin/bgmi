"use client";

import type { BgmiLiteRedeemCodePageContent } from "@/src/lib/bgmiLiteRedeemCodes";
import type { BgmiLiteRedeemUiLabels } from "@/src/lib/bgmiLiteRedeemUiDefaults";

type Props = {
  ui: BgmiLiteRedeemUiLabels;
  onPatchUi: (patch: Partial<BgmiLiteRedeemUiLabels>) => void;
};

const FIELDS: Array<{ key: keyof BgmiLiteRedeemUiLabels; label: string; multiline?: boolean }> = [
  { key: "liveBadge", label: "Live badge" },
  { key: "expiredBadge", label: "Expired badge" },
  { key: "inactiveLabel", label: "Inactive label" },
  { key: "copyLabel", label: "Copy button" },
  { key: "copiedLabel", label: "Copied button" },
  { key: "copyFailedLabel", label: "Copy failed button" },
  { key: "copyAriaCopied", label: "Copy aria (copied)" },
  { key: "copyAriaFailed", label: "Copy aria (failed)" },
  { key: "copyHint", label: "Clipboard blocked hint", multiline: true },
  { key: "expiredStatusLabel", label: "Expired status line" },
  { key: "loadMoreLive", label: "Load more (live)" },
  { key: "loadMoreExpired", label: "Load more (expired)" },
  { key: "emptyLiveToday", label: "Empty live (updated today)", multiline: true },
  { key: "emptyLiveIdle", label: "Empty live (not updated today)", multiline: true },
  { key: "emptyExpired", label: "Empty expired archive", multiline: true },
  { key: "freshnessIdleTitle", label: "No-new-codes title" },
  { key: "freshnessIdleText", label: "No-new-codes body", multiline: true },
  { key: "updatedLabelPrefix", label: "Updated label prefix (before date)" },
  { key: "faqTitle", label: "FAQ section title" },
  { key: "breadcrumbName", label: "Breadcrumb name" },
  { key: "socialImage", label: "OG / social image path" },
  { key: "socialImageAlt", label: "OG / social image alt" },
];

/** Admin fields for previously hardcoded public UI strings. */
export function AdminBgmiLiteRedeemUiFields({ ui, onPatchUi }: Props) {
  return (
    <>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>
        URL path stays locked to <code>/bgmi-lite-redeem-code</code>. Comment approve/delete stays in{" "}
        <code>/admin/comments</code>.
      </p>
      {FIELDS.map((field) => (
        <label key={field.key} style={{ display: "grid", gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{field.label}</span>
          {field.multiline ? (
            <textarea
              value={ui[field.key]}
              rows={3}
              onChange={(e) => onPatchUi({ [field.key]: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#e2e8f0",
                resize: "vertical",
              }}
            />
          ) : (
            <input
              value={ui[field.key]}
              onChange={(e) => onPatchUi({ [field.key]: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#e2e8f0",
              }}
            />
          )}
        </label>
      ))}
    </>
  );
}

export function patchRedeemPageUi(
  prev: BgmiLiteRedeemCodePageContent,
  patch: Partial<BgmiLiteRedeemUiLabels>,
): BgmiLiteRedeemCodePageContent {
  return { ...prev, ui: { ...prev.ui, ...patch } };
}
