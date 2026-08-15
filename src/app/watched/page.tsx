import { PageHeader } from "@/components/common/page-header";
import { WatchedTable } from "@/components/watched/watched-table";

export default function WatchedPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Archive"
        title="Watched"
        description="Everything you've logged, searchable and sortable in one console."
      />
      <WatchedTable />
    </div>
  );
}
