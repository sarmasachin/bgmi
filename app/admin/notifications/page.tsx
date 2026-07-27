import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminNotificationsClient from "./AdminNotificationsClient";
import { listNotificationCampaigns } from "@/src/server/repositories/notificationCampaignsRepository";
import { countPushSubscriptions } from "@/src/server/repositories/pushSubscriptionsRepository";
import {
  countActiveEmailSubscribers,
  listEmailSubscribers,
  syncSiteEmailsIntoSubscribers,
} from "@/src/server/repositories/emailSubscribersRepository";

export default async function AdminNotificationsPage() {
  const access = await requireAdminPageAccess("notifications.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialItems: Awaited<ReturnType<typeof listNotificationCampaigns>> | undefined;
  let initialStats: { pushCount: number; emailCount: number } | undefined;
  let initialSubscribers: Awaited<ReturnType<typeof listEmailSubscribers>> | undefined;
  try {
    await syncSiteEmailsIntoSubscribers();
    const [campaigns, pushCount, emailCount, subscribers] = await Promise.all([
      listNotificationCampaigns(50),
      countPushSubscriptions(),
      countActiveEmailSubscribers(),
      listEmailSubscribers(300),
    ]);
    initialItems = campaigns;
    initialStats = { pushCount, emailCount };
    initialSubscribers = subscribers;
  } catch {
    initialItems = undefined;
    initialStats = undefined;
    initialSubscribers = undefined;
  }

  return (
    <AdminNotificationsClient
      initialItems={initialItems}
      initialStats={initialStats}
      initialSubscribers={initialSubscribers}
    />
  );
}
