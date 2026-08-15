import { PageHeader } from "@/components/common/page-header";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Insight"
        title="Analytics"
        description="Genre distribution, release-year spread, and your top genres, directors, and actors — computed from your watched history."
      />
      <AnalyticsView />
    </div>
  );
}
