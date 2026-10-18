"use client";

import {
  freeFireApkHeroButtonPublicStatus,
  type FreeFireApkPageContent,
  type FreeFireApkPageSectionId,
} from "@/src/lib/freeFireApkPage";
import { AdminAccordionSection, AdminCheckbox, AdminCountdownTarget, AdminField, AdminLinesEditor } from "./adminFreeFireApkFields";

function HeroButtonStatus({
  btn,
  countdown,
}: {
  btn: FreeFireApkPageContent["heroButtons"]["apk"];
  countdown: FreeFireApkPageContent["countdown"];
}) {
  const status = freeFireApkHeroButtonPublicStatus(btn, countdown);
  return (
    <p
      style={{
        margin: "0 0 12px",
        fontSize: 12,
        fontWeight: 600,
        color: status.visible ? "#4ade80" : "#fbbf24",
        lineHeight: 1.45,
      }}
    >
      {status.message}
    </p>
  );
}

type Props = {
  page: FreeFireApkPageContent;
  openIds: Set<FreeFireApkPageSectionId>;
  onToggle: (id: FreeFireApkPageSectionId) => void;
  onPatch: (updater: (prev: FreeFireApkPageContent) => FreeFireApkPageContent) => void;
};

export function AdminFreeFireApkFormTop({ page, openIds, onToggle, onPatch }: Props) {
  return (
    <>
      <AdminAccordionSection id="seo" title="SEO" open={openIds.has("seo")} onToggle={onToggle}>
        <AdminField
          label="SEO title"
          value={page.seoTitle}
          onChange={(seoTitle) => onPatch((p) => ({ ...p, seoTitle }))}
        />
        <AdminField
          label="Meta description"
          value={page.seoDescription}
          multiline
          onChange={(seoDescription) => onPatch((p) => ({ ...p, seoDescription }))}
        />
        <AdminLinesEditor
          label="SEO keywords"
          lines={page.seoKeywords}
          onChange={(seoKeywords) => onPatch((p) => ({ ...p, seoKeywords }))}
        />
      </AdminAccordionSection>

      <AdminAccordionSection id="hero" title="Hero" open={openIds.has("hero")} onToggle={onToggle}>
        <AdminField
          label="H1 title"
          value={page.heroTitle}
          onChange={(heroTitle) => onPatch((p) => ({ ...p, heroTitle }))}
        />
        <AdminField
          label="Subtitle"
          value={page.subtitleEn}
          multiline
          rows={4}
          onChange={(subtitleEn) => onPatch((p) => ({ ...p, subtitleEn }))}
        />
        <AdminLinesEditor
          label="Pills"
          lines={page.pills.map((item) => item.label)}
          onChange={(labels) =>
            onPatch((p) => ({ ...p, pills: labels.map((label) => ({ label })) }))
          }
        />
        <AdminField
          label="Hero image URL (must start with / or https:// — leave empty to hide)"
          value={page.heroImage}
          onChange={(heroImage) => onPatch((p) => ({ ...p, heroImage }))}
        />
        <AdminField
          label="Hero image alt"
          value={page.heroImageAlt}
          onChange={(heroImageAlt) => onPatch((p) => ({ ...p, heroImageAlt }))}
        />
      </AdminAccordionSection>

      <AdminAccordionSection
        id="heroButtons"
        title="Hero buttons (Play Store + APK)"
        open={openIds.has("heroButtons")}
        onToggle={onToggle}
      >
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>
          Public page shows a button only if Show is on, label is filled, and URL is filled.
          We do not host APK files — paste the link you want. Check the yellow/green status under
          each button before saving.
        </p>
        <strong style={{ display: "block", color: "#e2e8f0", marginBottom: 8 }}>Play Store</strong>
        <HeroButtonStatus btn={page.heroButtons.playStore} countdown={page.countdown} />
        <AdminCheckbox
          label="Show Play Store button"
          checked={page.heroButtons.playStore.visible}
          onChange={(visible) =>
            onPatch((p) => ({
              ...p,
              heroButtons: { ...p.heroButtons, playStore: { ...p.heroButtons.playStore, visible } },
            }))
          }
        />
        <AdminField
          label="Play Store label"
          value={page.heroButtons.playStore.label}
          onChange={(label) =>
            onPatch((p) => ({
              ...p,
              heroButtons: { ...p.heroButtons, playStore: { ...p.heroButtons.playStore, label } },
            }))
          }
        />
        <AdminField
          label="Play Store URL"
          value={page.heroButtons.playStore.href}
          onChange={(href) =>
            onPatch((p) => ({
              ...p,
              heroButtons: { ...p.heroButtons, playStore: { ...p.heroButtons.playStore, href } },
            }))
          }
        />
        <strong style={{ display: "block", color: "#e2e8f0", margin: "8px 0" }}>APK</strong>
        <HeroButtonStatus btn={page.heroButtons.apk} countdown={page.countdown} />
        <AdminCheckbox
          label="Show APK button"
          checked={page.heroButtons.apk.visible}
          onChange={(visible) =>
            onPatch((p) => ({
              ...p,
              heroButtons: { ...p.heroButtons, apk: { ...p.heroButtons.apk, visible } },
            }))
          }
        />
        <AdminField
          label="APK label"
          value={page.heroButtons.apk.label}
          onChange={(label) =>
            onPatch((p) => ({
              ...p,
              heroButtons: { ...p.heroButtons, apk: { ...p.heroButtons.apk, label } },
            }))
          }
        />
        <AdminField
          label="APK URL (required to show on public page)"
          value={page.heroButtons.apk.href}
          onChange={(href) =>
            onPatch((p) => ({
              ...p,
              heroButtons: { ...p.heroButtons, apk: { ...p.heroButtons.apk, href } },
            }))
          }
        />
      </AdminAccordionSection>

      <AdminAccordionSection
        id="countdown"
        title="Update countdown"
        open={openIds.has("countdown")}
        onToggle={onToggle}
      >
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>
          While the timer is counting, Play/APK buttons stay hidden on the public page. When the
          timer ends or you turn it off, buttons show automatically (if Show + label + URL are set).
        </p>
        <AdminCheckbox
          label="Show update countdown"
          checked={page.countdown.visible}
          onChange={(visible) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, visible } }))
          }
        />
        <AdminField
          label="Countdown label"
          value={page.countdown.label}
          onChange={(label) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, label } }))
          }
        />
        <AdminCountdownTarget
          targetIso={page.countdown.targetIso}
          onChange={(targetIso) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, targetIso } }))
          }
        />
        <AdminField
          label="Date line under countdown"
          value={page.countdown.dateText}
          multiline
          onChange={(dateText) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, dateText } }))
          }
        />
        <AdminField
          label="Message when countdown ends"
          value={page.countdown.liveMessage}
          multiline
          onChange={(liveMessage) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, liveMessage } }))
          }
        />
      </AdminAccordionSection>
    </>
  );
}
