import { PageHeader } from "@/components/common/page-header";
import { NotificationList } from "@/components/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Alerts"
        title="Notifications"
        description="New and upcoming seasons for series already in your watched list — nothing else is monitored."
      />
      <NotificationList />
    </div>
  );
}
