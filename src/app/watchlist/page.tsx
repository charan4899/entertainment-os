import { PageHeader } from "@/components/common/page-header";
import { WatchlistTable } from "@/components/watchlist/watchlist-table";

export default function WatchlistPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Queue"
        title="Watchlist"
        description="What's next in line. Mark a title watched and it moves straight into your archive."
      />
      <WatchlistTable />
    </div>
  );
}
