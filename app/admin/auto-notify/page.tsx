import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { getAutoNotifySettings } from "@/src/server/repositories/autoNotifySettingsRepository";
import {
  countCampaignEmailsSentSince,
  getEmailCampaignSettings,
  startOfUtcDay,
} from "@/src/server/repositories/emailCampaignSendRepository";
import AdminAutoNotifyClient from "./AdminAutoNotifyClient";

export default async function AdminAutoNotifyPage() {
  const access = await requireAdminPageAccess("notifications.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialSettings = { newsOnPublish: false, pagesOnPublish: false };
  let initialEmailQuota = { dailySendLimit: 950, sentToday: 0, remainingToday: 950 };
  try {
    initialSettings = await getAutoNotifySettings();
    const email = await getEmailCampaignSettings();
    const sentToday = await countCampaignEmailsSentSince(startOfUtcDay());
    initialEmailQuota = {
      dailySendLimit: email.dailySendLimit,
      sentToday,
      remainingToday: Math.max(0, email.dailySendLimit - sentToday),
    };
  } catch {
    /* defaults */
  }

  return (
    <AdminAutoNotifyClient
      initialSettings={initialSettings}
      initialEmailQuota={initialEmailQuota}
    />
  );
}
